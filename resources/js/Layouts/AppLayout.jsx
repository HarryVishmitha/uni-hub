import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { Icon } from "@iconify/react";

const AppLayout = ({ children }) => {

    const top_changeable_links = [
        { name: 'Home', href: '/', icon: 'mdi:home' },
        { name: 'Courses', href: '/courses', icon: 'mdi:book-open-page-variant' },
        { name: 'Admissions', href: '/admissions', icon: 'mdi:school' },
    ];

    return (
        <div className="app-layout bg-gray-100 dark:bg-gray-800 min-h-screen flex flex-col">
            <header className="bg-white dark:bg-gray-900 shadow p-5 border-b-2 border-gray-300 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <div className="branding" id="branding-topnav">
                        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            <img
                                src="/assets/logo-full.png"
                                alt="Logo"
                                className="block dark:hidden w-32 ms-2"
                            />
                            <img
                                src="/assets/logo-full-dark.png"
                                alt="Logo"
                                className="hidden dark:block w-32 ms-2"
                            />
                        </Link>
                    </div>
                    <nav className="navigation flex items-center gap-5">
                        {top_changeable_links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition duration-150 ease-in-out"
                            >
                                <Icon icon={link.icon} className="me-1.5 text-xl" />
                                <span className="hidden sm:inline">{link.name}</span>
                            </Link>
                        ))}
                        <ThemeToggle variant="icon" size="md" />
                    </nav>
                </div>
            </header>
            <main className="mt-3 flex-grow">
                {children}
            </main>
            <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 text-center">
                <p>&copy; {new Date().getFullYear()} Uni-Hub. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AppLayout;
