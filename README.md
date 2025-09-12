# Uni-Hub 🎓

A modern university management system built with Laravel and React using Inertia.js, featuring a comprehensive dark/light theme switching system.

## 🚀 Features

- **Modern Stack**: Laravel 11 + React 18 + Inertia.js + Tailwind CSS
- **Dark/Light Theme**: Seamless theme switching with persistence
- **Responsive Design**: Mobile-first responsive layout
- **Authentication**: Complete user authentication system
- **Real-time Updates**: Dynamic content updates

## 🎨 Theme System

This application includes a comprehensive theme switching system that allows users to toggle between dark and light modes. The theme preference is automatically saved and restored across browser sessions.

### Theme Features

- **Auto-Detection**: Respects system theme preference by default
- **Persistence**: Theme choice saved to localStorage
- **Smooth Transitions**: Animated theme transitions
- **Accessibility**: Full keyboard navigation and ARIA support
- **Responsive**: Works on all screen sizes

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

- `sm` - Small (perfect for navigation bars)
- `md` - Medium (default size)
- `lg` - Large (prominent placement)

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
import { useTheme } from '@/Contexts/ThemeContext';

function MyComponent() {
  const { 
    theme,        // 'light' | 'dark'
    isDark,       // boolean
    isLight,      // boolean
    toggleTheme,  // function
    setDarkTheme, // function
    setLightTheme // function
  } = useTheme();
  
  return (
    <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
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
className="bg-white text-gray-900"

// Dark mode
className="dark:bg-gray-800 dark:text-gray-100"

// Combined
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

### Persistence

Theme preferences are automatically saved to `localStorage` and restored on page load:

```javascript
// Automatic persistence
localStorage.setItem('theme', 'dark');

// System preference detection
window.matchMedia('(prefers-color-scheme: dark)').matches
```

## 🎨 Customization

### Adding New Theme Variants

Extend the ThemeToggle component with custom variants:

```jsx
// In ThemeToggle.jsx
if (variant === 'custom') {
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
          light: '#your-light-color',
          dark: '#your-dark-color',
        }
      }
    }
  }
}
```

## 📱 Responsive Design

The theme system is fully responsive and works across all device sizes:

- **Desktop**: Icon toggle in navigation bar
- **Mobile**: Accessible toggle in mobile menu
- **Touch**: Optimized for touch interactions

## ♿ Accessibility

The theme system includes comprehensive accessibility features:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG compliant color schemes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- Laravel Framework
- React & Inertia.js
- Tailwind CSS
- Heroicons for theme icons
