import React from 'react';
import { useTheme } from '@/Contexts/ThemeContext';

const ThemeToggle = ({ className = '', size = 'md', variant = 'button' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    // Size configurations
    const sizes = {
        sm: {
            button: 'p-1.5 text-sm',
            icon: 'h-4 w-4',
        },
        md: {
            button: 'p-2 text-base',
            icon: 'h-5 w-5',
        },
        lg: {
            button: 'p-3 text-lg',
            icon: 'h-6 w-6',
        },
    };

    const currentSize = sizes[size] || sizes.md;

    // Button variant
    if (variant === 'button') {
        return (
            <button
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${currentSize.button} ${className}`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    // Sun icon for light mode
                    <svg
                        className={currentSize.icon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    // Moon icon for dark mode
                    <svg
                        className={currentSize.icon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>
        );
    }

    // Toggle switch variant
    if (variant === 'switch') {
        return (
            <div className={`flex items-center ${className}`}>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isDark}
                        onChange={toggleTheme}
                        className="sr-only"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 relative transition-colors duration-200 ease-in-out">
                        <div
                            className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform duration-200 ease-in-out flex items-center justify-center ${
                                isDark ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        >
                            {isDark ? (
                                <svg
                                    className="h-3 w-3 text-gray-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            ) : (
                                <svg
                                    className="h-3 w-3 text-yellow-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isDark ? 'Dark' : 'Light'}
                    </span>
                </label>
            </div>
        );
    }

    // Icon only variant
    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 transition duration-150 ease-in-out hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${currentSize.button} ${className}`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    <svg
                        className={currentSize.icon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg
                        className={currentSize.icon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>
        );
    }

    return null;
};

export default ThemeToggle;
