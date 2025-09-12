import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Seo from '@/seo/Seo';
import { WebsiteSchema, WebPageSchema } from '@/seo/schema';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <AppLayout>
            <Seo
                title="Home"
                description="Explore courses, admissions, and resources."
                keywords={['LMS', 'University', 'Courses', 'Admissions']}
                image="/images/og/home.png"
                type="website"
                schema={[
                    WebsiteSchema('LMS', window.location.origin),
                    WebPageSchema({ name: 'Home', url: window.location.href }),
                ]}
                preconnect={['https://fonts.gstatic.com']}
                preload={[
                    { href: '/fonts/Inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
                ]}
            />
            <h1>Welcome to unihub</h1>
            <p>
                This is a simple application built with Laravel and React.
            </p>
        </AppLayout>
    );
}
