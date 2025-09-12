import { Head, usePage } from '@inertiajs/react';

/**
 * Props:
 *  - title, description, keywords (array|string), image, canonical
 *  - type ('website'|'article'), robots ({index,follow,...})
 *  - hreflang ([{href,lang}]), pagination ({prev,next})
 *  - schema (array of plain objects → JSON-LD)
 *  - preconnect (string[]), preload ([{href,as,type,crossorigin}])
 */
export default function Seo(props = {}) {
    const { props: pageProps } = usePage();
    const SITE = pageProps?.SITE || {};

    const clamp = (s = '', n = 160) =>
        String(s).replace(/\s+/g, ' ').trim().slice(0, n);

    const toAbs = (url) => {
        if (!url) return SITE.baseUrl;
        try { return new URL(url, SITE.baseUrl).toString(); } catch { return SITE.baseUrl; }
    };

    const arrayKeywords = () => {
        const k = props.keywords ?? SITE.keywords ?? [];
        return Array.isArray(k) ? k.join(', ') : String(k || '');
    };

    const titleRaw =
        props.title ||
        SITE.defaultTitle ||
        SITE.name;

    const title = titleRaw || SITE.defaultTitle || SITE.name;


    const description = clamp(props.description || SITE.description || '', 155);
    const canonical = toAbs(props.canonical || (pageProps?.ziggy?.location ?? window.location?.href));

    const ogType = props.type || 'website';
    const ogImage = toAbs(props.image || SITE.ogImage);
    const twitterCard = props.twitterCard || 'summary_large_image';

    // robots
    const allowIndex = SITE.indexable !== false && (props.robots?.index ?? true);
    const allowFollow = props.robots?.follow ?? true;
    const robotsContent = [
        allowIndex ? 'index' : 'noindex',
        allowFollow ? 'follow' : 'nofollow',
        props.robots?.maxSnippet ? `max-snippet:${props.robots.maxSnippet}` : null,
        props.robots?.maxImagePreview ? `max-image-preview:${props.robots.maxImagePreview}` : null,
        props.robots?.maxVideoPreview ? `max-video-preview:${props.robots.maxVideoPreview}` : null,
    ].filter(Boolean).join(', ');

    const schemaList = (props.schema || []).filter(Boolean);

    return (
        <Head>
            {/* Primary */}
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            {arrayKeywords() && <meta name="keywords" content={arrayKeywords()} />}
            <link rel="canonical" href={canonical} />

            {/* Robots */}
            <meta name="robots" content={robotsContent} />
            <meta name="googlebot" content={robotsContent} />

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            <meta property="og:url" content={canonical} />
            {SITE.name && <meta property="og:site_name" content={SITE.name} />}
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            {SITE.twitter?.site && <meta name="twitter:site" content={SITE.twitter.site} />}
            <meta name="twitter:title" content={title} />
            {description && <meta name="twitter:description" content={description} />}
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Pagination rels */}
            {props.pagination?.prev && <link rel="prev" href={toAbs(props.pagination.prev)} />}
            {props.pagination?.next && <link rel="next" href={toAbs(props.pagination.next)} />}

            {/* Hreflang */}
            {(props.hreflang || []).map((alt, i) => (
                <link key={i} rel="alternate" hrefLang={alt.lang} href={toAbs(alt.href)} />
            ))}

            {/* Resource Hints */}
            {(props.preconnect || []).map((h, i) => (
                <link key={`pc-${i}`} rel="preconnect" href={h} crossOrigin="" />
            ))}
            {(props.preload || []).map((p, i) => (
                <link
                    key={`pl-${i}`}
                    rel="preload"
                    href={p.href}
                    as={p.as}
                    type={p.type}
                    crossOrigin={p.crossorigin ? '' : undefined}
                />
            ))}

            {/* JSON-LD */}
            {schemaList.map((obj, i) => (
                <script key={`ld-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify(obj),
                }} />
            ))}

            {/* Theme colors for light/dark (optional but nice) */}
            {SITE.themeColorLight && (
                <meta name="theme-color" media="(prefers-color-scheme: light)" content={SITE.themeColorLight} />
            )}
            {SITE.themeColorDark && (
                <meta name="theme-color" media="(prefers-color-scheme: dark)" content={SITE.themeColorDark} />
            )}
        </Head>
    );
}
