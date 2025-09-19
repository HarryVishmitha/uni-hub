import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Be Vietnam Pro", "sans-serif"],
            },
            animation: {
                'fadeIn': 'fadeIn 0.2s ease-in-out',
                'slideDown': 'slideDown 0.3s ease-in-out',
                'slide-in-right': 'slideInRight 0.3s forwards',
                'slide-out-right': 'slideOutRight 0.3s forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' }
                },
            },
            boxShadow: {
                'alert': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'alert-dark': '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
        },
    },

    darkMode: ['class', '[data-theme="dark"]'],

    plugins: [forms],
};
