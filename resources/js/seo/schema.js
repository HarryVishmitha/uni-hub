export const WebsiteSchema = (name, url) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
});

export const WebPageSchema = ({ name, url }) => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
});
