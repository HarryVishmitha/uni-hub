import React from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/Contexts/ThemeContext';

const ThemeShowcase = () => {
    const { theme, isDark } = useTheme();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                Theme Toggle Component Showcase
            </h1>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                    Current theme: <span className="font-semibold">{theme}</span>
                    {isDark ? ' 🌙' : ' ☀️'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Button Variant */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Button Variant
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Small</p>
                            <ThemeToggle variant="button" size="sm" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium</p>
                            <ThemeToggle variant="button" size="md" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Large</p>
                            <ThemeToggle variant="button" size="lg" />
                        </div>
                    </div>
                </div>

                {/* Icon Variant */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Icon Variant
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Small</p>
                            <ThemeToggle variant="icon" size="sm" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium</p>
                            <ThemeToggle variant="icon" size="md" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Large</p>
                            <ThemeToggle variant="icon" size="lg" />
                        </div>
                    </div>
                </div>

                {/* Switch Variant */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Switch Variant
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Small</p>
                            <ThemeToggle variant="switch" size="sm" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium</p>
                            <ThemeToggle variant="switch" size="md" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Large</p>
                            <ThemeToggle variant="switch" size="lg" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Usage Examples
                </h3>
                <div className="space-y-2 text-sm">
                    <code className="block p-2 bg-gray-100 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200">
                        {'<ThemeToggle variant="button" size="md" />'}
                    </code>
                    <code className="block p-2 bg-gray-100 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200">
                        {'<ThemeToggle variant="icon" size="sm" className="ml-4" />'}
                    </code>
                    <code className="block p-2 bg-gray-100 dark:bg-gray-600 rounded text-gray-800 dark:text-gray-200">
                        {'<ThemeToggle variant="switch" size="lg" />'}
                    </code>
                </div>
            </div>
        </div>
    );
};

export default ThemeShowcase;
