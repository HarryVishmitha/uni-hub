# Uni-Hub 🎓

A modern university management system built with Laravel and React using Inertia.js, featuring a comprehensive dark/light theme switching system.

## 🚀 Features

-   **Modern Stack**: Laravel 11 + React 18 + Inertia.js + Tailwind CSS
-   **Dark/Light Theme**: Seamless theme switching with persistence
-   **Responsive Design**: Mobile-first responsive layout
-   **Authentication**: Complete user authentication system
-   **Real-time Updates**: Dynamic content updates

## 🔐 Role-Based Access Control (RBAC)

Uni-Hub ships with [spatie/laravel-permission](https://spatie.be/docs/laravel-permission) to provide fine-grained role and permission management across the Laravel back end and the Inertia-driven React front end.

-   **Route guards** live in `routes/web.php` and use `role` / `permission` middleware to separate the admin, staff, and student areas.
-   **Policies** under `app/Policies` add contextual checks on top of permission middleware (for example, verifying a staff member belongs to the correct department before editing a course).
-   **Front-end awareness** is provided by `app/Http/Middleware/HandleInertiaRequests`, which shares the authenticated user's roles and permissions with every React page via `usePage().props.auth`.
-   **Automatic cache busting** is handled by `App\Support\Rbac\RbacCache`, ensuring permission changes take effect without any manual cache reset.

### Default roles & permissions

| Role    | Intended users       | Key permissions |
|---------|----------------------|-----------------|
| `admin` | Platform owners      | Full access to every permission |
| `staff` | Department operators | `manage-*` permissions for courses, departments, enrollments plus read-only access to school data |
| `student` | Learners             | Read-only access (`view-*`) to courses, departments, school, and their enrollments |

Seed the default RBAC data (roles, permissions, and a default administrator) any time you set up a fresh database:

```bash
php artisan db:seed --class=RbacSeeder
```

### Managing access from the UI

1. Sign in with an administrator account (the seeder above creates `admin@university.local` / password `admin`).
2. Navigate to `/admin/roles`, `/admin/permissions`, or `/admin/users` to grant or revoke access directly from the web application.
3. Changes are reflected immediately thanks to the RBAC cache listeners registered in `App\Providers\AppServiceProvider`.

### Adding a new access-controlled feature

1. **Create a permission** – add it through the Permissions screen or in a seeder/migration:

    ```php
    use Spatie\Permission\Models\Permission;

    Permission::firstOrCreate(['name' => 'manage-library']);
    ```

2. **Assign the permission** – either via the Roles UI or in code:

    ```php
    use Spatie\Permission\Models\Role;

    Role::findByName('staff')->givePermissionTo('manage-library');
    ```

3. **Protect the back end** – attach the permission middleware to your routes or controller:

    ```php
    Route::middleware(['auth', 'permission:manage-library'])
        ->resource('library', LibraryController::class);
    ```

    For complex scenarios, add or update a policy in `app/Policies` and call `$this->authorize(...)` inside your controller methods (see `CoursePolicy` for reference).

4. **Surface the feature in React** – gate menus and components by checking the injected permissions:

    ```jsx
    import { usePage } from '@inertiajs/react';

    const permissions = usePage().props.auth.user?.permissions ?? [];
    const canManageLibrary = permissions.includes('manage-library');

    if (canManageLibrary) {
        // Render links or components for the new module
    }
    ```

5. **Reset caches when scripting changes** – run `php artisan permission:cache-reset` if you manipulated permissions directly in code or a tinker session outside of the HTTP layer.

Following these steps keeps the database, middleware, policies, and front-end UI in sync whenever you introduce a new capability.

## 🧭 Application Structure

-   **Routing**: Public routes are defined in `routes/web.php`. Authenticated areas are grouped by role (`admin/*`, `staff/*`, and student read-only pages) with permission middleware applied per resource.
-   **Controllers**: Feature logic lives in `app/Http/Controllers`, with dedicated namespaces for admin management (`Admin\UserController`, `Admin\RoleController`, `Admin\PermissionController`) and domain features (`CourseController`, `DepartmentController`, `EnrollmentController`).
-   **Policies**: Domain-specific authorization rules are stored in `app/Policies`, enabling checks beyond simple permission flags (e.g., department ownership).
-   **Front end**: Inertia pages and layouts reside in `resources/js`. `Layouts/AuthenticatedLayout.jsx` wires the top bar and theme switcher, while individual pages consume shared auth props to tailor the UI per role.
-   **Shared data**: `app/Http/Middleware/HandleInertiaRequests` exposes site metadata plus role/permission information to every page, helping React components remain authorization-aware without additional API calls.

## 🎨 Theme System

This application includes a comprehensive theme switching system that allows users to toggle between dark and light modes. The theme preference is automatically saved and restored across browser sessions.

### Theme Features

-   **Auto-Detection**: Respects system theme preference by default
-   **Persistence**: Theme choice saved to localStorage
-   **Smooth Transitions**: Animated theme transitions
-   **Accessibility**: Full keyboard navigation and ARIA support
-   **Responsive**: Works on all screen sizes

## 🔧 Theme Usage

### Using the ThemeToggle Component

The `ThemeToggle` component is available in three variants with three different sizes:

#### Variants

1. **Button Variant** - Styled button with background

```jsx
<ThemeToggle variant="button" size="md" />
```

2. **Icon Variant** - Clean icon-only button

```jsx
<ThemeToggle variant="icon" size="sm" />
```

3. **Switch Variant** - Toggle switch with labels

```jsx
<ThemeToggle variant="switch" size="lg" />
```

#### Sizes

-   `sm` - Small (perfect for navigation bars)
-   `md` - Medium (default size)
-   `lg` - Large (prominent placement)

#### Custom Styling

```jsx
<ThemeToggle
    variant="icon"
    size="md"
    className="ml-4 hover:bg-blue-100 dark:hover:bg-blue-900"
/>
```

### Using the Theme Context

Access theme state and controls in any component:

```jsx
import { useTheme } from "@/Contexts/ThemeContext";

function MyComponent() {
    const {
        theme, // 'light' | 'dark'
        isDark, // boolean
        isLight, // boolean
        toggleTheme, // function
        setDarkTheme, // function
        setLightTheme, // function
    } = useTheme();

    return (
        <div className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>
                Switch to {isDark ? "light" : "dark"} mode
            </button>
        </div>
    );
}
```

### Theme Integration Examples

#### Navigation Bar

```jsx
// Add to any navigation component
<div className="flex items-center space-x-4">
    <nav>...</nav>
    <ThemeToggle variant="icon" size="sm" />
</div>
```

#### Settings Page

```jsx
// Settings form with theme switch
<div className="space-y-4">
    <h3>Appearance</h3>
    <ThemeToggle variant="switch" size="md" />
</div>
```

#### Floating Action

```jsx
// Floating theme toggle
<div className="fixed bottom-4 right-4">
    <ThemeToggle variant="button" size="lg" />
</div>
```

## 📦 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd uni-hub
```

2. **Install PHP dependencies**

```bash
composer install
```

3. **Install Node.js dependencies**

```bash
npm install
```

4. **Environment setup**

```bash
cp .env.example .env
php artisan key:generate
```

5. **Database setup**

```bash
php artisan migrate
```

6. **Build assets**

```bash
npm run build
# or for development
npm run dev
```

## 🛠️ Development

### Running the Application

```bash
# Start Laravel server
php artisan serve

# Start Vite development server (in another terminal)
npm run dev
```

### Building for Production

```bash
# Build optimized assets
npm run build
```

### Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## 🎯 Theme System Architecture

### File Structure

```
resources/js/
├── Contexts/
│   └── ThemeContext.jsx          # Theme context provider
├── Components/
│   ├── ThemeToggle.jsx           # Reusable theme toggle
│   └── ThemeShowcase.jsx         # Component examples
├── Layouts/
│   ├── AuthenticatedLayout.jsx   # Main app layout
│   └── GuestLayout.jsx           # Guest pages layout
└── app.jsx                       # App entry point
```

### Theme Classes

The system uses Tailwind CSS with the following approach:

```jsx
// Light mode (default)
className = "bg-white text-gray-900";

// Dark mode
className = "dark:bg-gray-800 dark:text-gray-100";

// Combined
className = "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
```

### Persistence

Theme preferences are automatically saved to `localStorage` and restored on page load:

```javascript
// Automatic persistence
localStorage.setItem("theme", "dark");

// System preference detection
window.matchMedia("(prefers-color-scheme: dark)").matches;
```

## 🎨 Customization

### Adding New Theme Variants

Extend the ThemeToggle component with custom variants:

```jsx
// In ThemeToggle.jsx
if (variant === "custom") {
    return (
        <button onClick={toggleTheme} className="your-custom-classes">
            {/* Your custom implementation */}
        </button>
    );
}
```

### Custom Theme Colors

Modify Tailwind configuration for custom theme colors:

```javascript
// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    light: "#your-light-color",
                    dark: "#your-dark-color",
                },
            },
        },
    },
};
```

## 📱 Responsive Design

The theme system is fully responsive and works across all device sizes:

-   **Desktop**: Icon toggle in navigation bar
-   **Mobile**: Accessible toggle in mobile menu
-   **Touch**: Optimized for touch interactions

## ♿ Accessibility

The theme system includes comprehensive accessibility features:

-   **Keyboard Navigation**: Full keyboard support
-   **Screen Readers**: Proper ARIA labels and descriptions
-   **Focus Management**: Clear focus indicators
-   **Color Contrast**: WCAG compliant color schemes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

-   Laravel Framework
-   React & Inertia.js
-   Tailwind CSS
-   Heroicons for theme icons

🧠 SEO Head Management (Seo.jsx)

This project includes a production-grade SEO head manager using Inertia + React. It handles:

✅ <title> tag (auto-formatted)

✅ <meta name="description">, <meta name="keywords">

✅ Canonical links

✅ Open Graph & Twitter cards

✅ Pagination rels (prev, next)

✅ Hreflang support (for multilingual SEO)

✅ JSON-LD structured data (schema.org)

✅ Robots policies (index, noindex, etc.)

✅ Preload & preconnect for performance

🛠 Usage

Import and use the Seo component in any page:

import Seo from '@/seo/Seo';
import { WebPageSchema } from '@/seo/schema';

export default function Welcome() {
return (
<>
<Seo
title="Home"
description="Explore all programs, courses, and admissions."
keywords={['LMS', 'Courses', 'Admissions', 'University']}
image="/images/og/home.png"
canonical={route('home')}
type="website"
schema={[
WebPageSchema({ name: 'Home', url: window.location.href }),
]}
/>
</>
);
}

⚙️ Configuration
Shared globally from middleware:

app/Http/Middleware/HandleInertiaRequests.php

'SITE' => [
'name' => config('app.name', 'LMS'),
'baseUrl' => config('app.url'),
'defaultTitle' => 'LMS — Learning that shapes the world',
'description' => 'Official Learning Management System.',
'keywords' => ['LMS','University','Courses','Admissions'],
'ogImage' => asset('images/og/default-og.png'),
'twitter' => ['site' => '@your_handle'],
'indexable' => app()->environment('production'),
]

Blade root file must include:
@inertiaHead

✅ Tip: Laravel will automatically append the site name (e.g. - Uni-Hub) to the title. So avoid duplicating the site name inside Seo.jsx.

🧩 Schema Examples (optional)

resources/js/seo/schema.js

export const WebPageSchema = ({ name, url }) => ({
'@context': 'https://schema.org',
'@type': 'WebPage',
name,
url,
});

🧼 Cleanup (optional)

To remove the large data-page JSON from <div id="app"> after hydration:

resources/js/app.jsx

setup({ el, App, props }) {
createRoot(el).render(<App {...props} />);
queueMicrotask(() => {
try { el.removeAttribute('data-page'); } catch {}
});
}
