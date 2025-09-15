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
            <p className="mt-6 text-gray-500 h-96"> 
                This is a simple application built with Laravel and React.
            </p>
            <div className="h-96 bg-blue-500">hi</div>
        </AppLayout>
    );
}
