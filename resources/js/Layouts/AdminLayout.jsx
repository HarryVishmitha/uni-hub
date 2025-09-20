import { Link, usePage, Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { Icon } from '@iconify/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/Contexts/ThemeContext';
import AlertContainer from '@/Components/AlertContainer';
import { AlertProvider, useAlerts } from '@/Contexts/AlertContext';

// Create a context for AdminLayout features
const AdminContext = createContext(null);

/**
 * AdminLayout
 * - Floating (not flush) sidebar that can be pinned/unpinned
 * - Compact sticky topbar with ThemeToggle (icon variant)
 * - Works with Tailwind + dark mode
 * - Mobile: off‑canvas with backdrop
 * - Desktop: detached "card" sidebar that does not shift page width
 * - Keyboard: [Ctrl/Cmd + b] toggles sidebar
 * - Alert system: Displays notifications in the top-right corner
 *
 * Usage: export default (page) => <AdminLayout title="Dashboard" header={<h1>Dashboard</h1>}>{page}</AdminLayout>
 */
export default function AdminLayout({ title, header, children, showHeaderThemeToggle = false }) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const permissions = props?.auth?.permissions || [];
    const roles = (props?.auth?.roles || []).map(r => String(r));
    const roleSlugs = roles.map(r => r.toLowerCase().replace(/\s+/g, '_'));
    const isSuper = roleSlugs.includes('super_admin') || user?.is_super === true;
    const { theme, isDark } = useTheme();

    // Flash messages from backend can be automatically shown as alerts
    const flash = usePage().props.flash || {};

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarPinned, setSidebarPinned] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin.sidebarPinned') ?? 'true'); } catch { return true; }
    });

    // Example alerts for demonstration - kept empty by default
    const [demoAlerts, setDemoAlerts] = useState([]);

    // Handle pin toggle without confirmation
    const handlePinToggle = () => {
        setSidebarPinned(!sidebarPinned);
    };

    // Persist pin preference
    useEffect(() => {
        try {
            localStorage.setItem('admin.sidebarPinned', JSON.stringify(sidebarPinned));
        } catch (e) {
            console.error('Failed to save sidebar pin state:', e);
        }
    }, [sidebarPinned]);

    // Keyboard shortcut: Ctrl/Cmd + B
    useEffect(() => {
        const onKey = (e) => {
            // Ctrl/Cmd + B to toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                if (sidebarOpen) {
                    setSidebarOpen(false);
                } else {
                    setSidebarOpen(true);
                    // If opening via keyboard and sidebar isn't pinned, auto-pin it
                    if (!sidebarPinned) {
                        setSidebarPinned(true);
                    }
                }
            }

            // Escape key to close sidebar
            if (e.key === 'Escape' && sidebarOpen && !sidebarPinned) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [sidebarOpen, sidebarPinned]);

    // Demo nav: replace with your app links
    const nav = useMemo(
        () => [
            // Dashboard
            { name: 'Dashboard', routeName: 'admin.dashboard', icon: 'lucide:layout-dashboard', perm: null },

            // Content Management
            { type: 'header', name: 'Content Management' },
            { name: 'Universities', routeName: 'admin.universities.index', icon: 'lucide:building', perm: 'manage-universities' },
            { name: 'Branches', routeName: 'admin.branches.index', icon: 'lucide:git-branch', perm: ['manage-branches', 'view-branches'] },
            { name: 'Org Units', routeName: 'admin.org-units.index', icon: 'lucide:network', perm: ['manage-org-units', 'view-org-units'] },
            { name: 'Departments', routeName: 'admin.departments.index', icon: 'lucide:folder-tree', perm: ['manage-departments', 'view-departments'] },

            // Academic Management
            { type: 'header', name: 'Academic Management' },
            { name: 'Terms', routeName: 'admin.terms.index', icon: 'lucide:calendar-clock', perm: ['manage-terms', 'view-terms'] },
            { name: 'Programs', routeName: 'admin.programs.index', icon: 'lucide:notebook-tabs', perm: ['manage-programs', 'view-programs'] },
            { name: 'Curricula', routeName: 'admin.curricula.index', icon: 'lucide:list-checks', perm: ['manage-curricula', 'view-curricula'] },
            { name: 'Courses', routeName: 'admin.courses.index', icon: 'lucide:book-open', perm: ['manage-courses', 'view-courses'] },
            { name: 'Requirements', routeName: 'admin.requirements.index', icon: 'lucide:clipboard-check', perm: ['manage-requirements', 'view-requirements'] },

            // User Management
            { type: 'header', name: 'User Management' },
            { name: 'Students', routeName: 'admin.students.index', icon: 'lucide:users', perm: ['manage-students', 'view-students'] },
            { name: 'Faculty', routeName: 'admin.faculty.index', icon: 'lucide:graduation-cap', perm: ['manage-faculty', 'view-faculty'] },
            { name: 'Staff', routeName: 'admin.staff.index', icon: 'lucide:briefcase', perm: ['manage-staff', 'view-staff'] },
            { name: 'Enrollments', routeName: 'admin.enrollments.index', icon: 'lucide:clipboard-list', perm: ['manage-enrollments', 'view-enrollments'] },

            // System Administration
            { type: 'header', name: 'System' },
            { name: 'User Accounts', routeName: 'admin.users.index', icon: 'lucide:user-cog', perm: 'manage-users' },
            { name: 'Roles & Permissions', routeName: 'admin.roles.index', icon: 'lucide:shield', perm: 'manage-roles' },
            { name: 'Settings', routeName: 'admin.settings.index', icon: 'lucide:settings', perm: 'manage-settings' },
            { name: 'Audit Logs', routeName: 'admin.audit-logs.index', icon: 'lucide:history', perm: 'view-logs' },

            // Tools
            { type: 'header', name: 'Tools' },
            { name: 'Import Data', routeName: 'admin.tools.import', icon: 'lucide:upload', perm: 'import-data' },
            { name: 'Export Data', routeName: 'admin.tools.export', icon: 'lucide:download', perm: 'export-data' },
            { name: 'System Health', routeName: 'admin.tools.health', icon: 'lucide:activity', perm: 'view-system-health' },
            { name: 'Alerts Demo', routeName: 'admin.demo.index', icon: 'lucide:bell', perm: null },
        ],
        [],
    );

    const can = (perm) => {
        // Always show items for super admin
        if (isSuper || roles?.includes('Super Admin') || roles?.includes('super_admin') || permissions?.includes('*')) {
            return true;
        }

        // Public items that don't require permissions
        if (!perm) return true;

        // Check array of permissions (OR logic)
        if (Array.isArray(perm)) {
            return perm.some((p) => permissions?.includes(p));
        }

        // Check single permission
        return permissions?.includes(perm);
    };

    return (
        <AlertProvider>
            <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen, sidebarPinned, setSidebarPinned, user, permissions, roles, isSuper }}>
                <AdminLayoutContent
                    title={title}
                    header={header}
                    showHeaderThemeToggle={showHeaderThemeToggle}
                    isDark={isDark}
                    nav={nav}
                    can={can}
                    user={user}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    sidebarPinned={sidebarPinned}
                    handlePinToggle={handlePinToggle}
                    demoAlerts={demoAlerts}
                >
                    {children}
                </AdminLayoutContent>
            </AdminContext.Provider>
        </AlertProvider>
    );
}

// Separated for better organization and to avoid re-renders
function AdminLayoutContent({
    title,
    header,
    showHeaderThemeToggle,
    isDark,
    nav,
    can,
    user,
    sidebarOpen,
    setSidebarOpen,
    sidebarPinned,
    handlePinToggle,
    children,
    demoAlerts
}) {
    const { alerts, removeAlert } = useAlerts();

    // Combine demo alerts with context alerts
    const allAlerts = useMemo(() => {
        return [...demoAlerts, ...alerts];
    }, [demoAlerts, alerts]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
            {title && (
                <Head>
                    <title>{title}</title>
                    {/* Optional: theme‑aware color */}
                    <meta name="theme-color" content={isDark ? '#0b1220' : '#ffffff'} />
                </Head>
            )}

            {/* Topbar */}
            <Topbar
                user={user}
                onMenu={() => setSidebarOpen(true)}
            />

            {/* Alert Container */}
            <AlertContainer
                alerts={allAlerts}
                onDismiss={removeAlert}
            />

            {/* Detached Sidebar container */}
            <Sidebar
                nav={nav.filter((n) => n.type === 'header' || can(n.perm))}
                open={sidebarOpen}
                pinned={sidebarPinned}
                onClose={() => setSidebarOpen(false)}
                onPinToggle={handlePinToggle}
            />

            {/* Main content wrapper - with sidebar-aware padding */}
            <main className="transition-all duration-300 ease-in-out">
                <div className={`pt-20 pb-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${(sidebarOpen || sidebarPinned) ? 'lg:pl-80' : ''}`}>
                    {header && (
                        <div className="mb-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Admin</div>
                                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{header}</div>
                            </div>
                            {/* Quick theme access (example: icon variant, small) */}
                            {showHeaderThemeToggle && (<ThemeToggle variant="icon" size="sm" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" />)}
                        </div>
                    )}

                    <div className="grid gap-6">
                        {children}
                    </div>
                </div>
            </main>

            {/* Floating sidebar toggle button with vertical line */}
            {!sidebarOpen && !sidebarPinned && (
                <div className="fixed z-30 left-0 top-0 h-full flex items-center pointer-events-none">
                    <div className="h-[75%] w-2 bg-emerald-600/70 rounded-r"></div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="bg-emerald-600 text-white p-2.5 rounded-full shadow-lg hover:bg-emerald-700 transition-all pointer-events-auto flex items-center justify-center ml-2"
                        aria-label="Open sidebar"
                    >
                        <Icon icon="lucide:chevrons-right" className="text-xl" />
                    </button>
                </div>
            )}

            {/* Accessibility skip link */}
            <a
                href="#main-content"
                className="absolute top-0 left-0 -translate-y-full focus:translate-y-0 bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 p-4 m-3 z-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
                Skip to main content
            </a>
        </div>
    );
}


function Topbar({ user, onMenu }) {
    return (
        <header className="fixed top-0 inset-x-0 z-40 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenu}
                        className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 dark:bg-gray-500 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        aria-label="Open menu"
                    >
                        <Icon icon="lucide:panel-left-open" className="text-xl" />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/assets/logo-full.png" alt="Logo" className="block dark:hidden h-8" />
                        <img src="/assets/logo-full-dark.png" alt="Logo" className="hidden dark:block h-8" />
                    </Link>

                    {/* Quick links */}
                    <div className="hidden md:flex items-center ml-4">
                        <Link
                            href={route().has('help') ? route('help') : '#'}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Help
                        </Link>
                        <Link
                            href={route().has('documentation') ? route('documentation') : '#'}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Documentation
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search button - can be expanded to a full search component */}
                    <button
                        className="hidden md:inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Search"
                    >
                        <Icon icon="lucide:search" className="text-base" />
                        <span>Search...</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">⌘K</span>
                    </button>

                    {/* Theme toggle (icon) */}
                    <ThemeToggle variant="icon" size="sm" className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50" />

                    {/* Profile */}
                    <UserMenu user={user} />
                </div>
            </div>
        </header>
    );
}

function Sidebar({ nav, open, pinned, onClose, onPinToggle }) {
    const panelRef = useRef(null);

    // Close on outside click (mobile only)
    useEffect(() => {
        if (!open) return;
        function onDown(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
        }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open, onClose]);

    // Use a fixed position sidebar with a left offset
    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Floating card sidebar */}
            <aside
                ref={panelRef}
                className={`fixed z-50 top-20 left-4 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur transition-all duration-300 ease-in-out ${open || pinned ? 'translate-x-0' : '-translate-x-[130%]'
                    } ${open && !pinned ? 'lg:shadow-2xl' : ''}`}
                role="dialog"
                aria-label="Navigation"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Icon icon="lucide:compass" />
                        <span>Admin Navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Pin/Unpin toggle button */}
                        <button
                            onClick={onPinToggle}
                            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs border hover:bg-gray-100 dark:bg-gray-900  dark:hover:bg-gray-800"
                            style={{
                                borderColor: pinned ? 'rgb(16, 185, 129)' : 'rgb(209, 213, 219)',
                                color: pinned ? 'rgb(4, 120, 87)' : 'rgb(75, 85, 99)'
                            }}
                        >
                            <Icon icon={pinned ? 'lucide:pin' : 'lucide:pin-off'} />
                            {pinned ? 'Pinned' : 'Pin Sidebar'}
                        </button>
                        <button onClick={onClose} className="inline-flex rounded-xl p-2 hover:bg-gray-100 dark:bg-gray-300 dark:hover:bg-gray-200" aria-label="Close">
                            <Icon icon="lucide:x" />
                        </button>
                    </div>
                </div>

                <nav className="overflow-y-auto py-2">
                    {nav.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                            No sections available. Check your RBAC permissions or seed roles.
                        </div>
                    ) : (
                        nav
                            .filter(item => item.type === 'header' || route().has(item.routeName))
                            .map((item, index) => <NavItem key={item.type === 'header' ? `header-${index}` : item.routeName} item={item} />)
                    )}
                </nav>

                <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/60 dark:to-gray-900/60 sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10">
                    {/* Switch variant example inside sidebar */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Appearance</span>
                        <ThemeToggle variant="switch" size="sm" />
                    </div>
                </div>
            </aside>
        </>
    );
}

function NavItem({ item }) {
    // If this is a header, render a section divider
    if (item.type === 'header') {
        return (
            <div className="mx-3 mt-5 mb-2 px-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {item.name}
                </div>
            </div>
        );
    }

    if (!route().has(item.routeName)) {
        return null;
    }

    // Check if the current route matches the item's route name
    const isActive = route().current(item.routeName);

    return (
        <Link
            href={route(item.routeName)}
            className={`group mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150
                ${isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
            <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${isActive
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-300'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                <Icon icon={item.icon} className="text-lg" />
            </div>

            <span className="text-sm font-medium">{item.name}</span>

            {isActive && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500"></span>
            )}
        </Link>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const { success, error, warning, info } = useAlerts();
    const menuRef = useRef(null);
    const { props } = usePage();

    useEffect(() => {
        function onDown(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    // Demo function to show alerts - you can remove this in production
    const showDemoAlert = (e) => {
        e.preventDefault();
        const alertTypes = {
            success: () => success('Operation completed successfully! Everything worked as expected.'),
            error: () => error('An error occurred while processing your request. Please try again or contact support if the issue persists.'),
            warning: () => warning('This action may have unexpected consequences. Please review before proceeding.'),
            info: () => info('The system will be undergoing maintenance in 2 hours. Please save your work.')
        };

        // Get random alert type
        const types = Object.keys(alertTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        alertTypes[randomType]();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <img
                    src={user?.profile_photo_url || '/assets/avatar.png'}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                />
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email || ''}</div>
                </div>
                <Icon icon="lucide:chevron-down" className={`text-sm text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'
                }`}>
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Account'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>

                <div className="py-1">
                    <Link href={route().has('profile.show') ? route('profile.show') : '#'} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white dark:text-gray-500">
                        <Icon icon="lucide:user" className="text-base text-gray-500 dark:text-gray-400" />
                        <span>Profile</span>
                    </Link>
                    <Link href={route().has('notifications.index') ? route('notifications.index') : '#'} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white dark:text-gray-500">
                        <Icon icon="lucide:bell" className="text-base text-gray-500 dark:text-gray-400" />
                        <span>Notifications</span>
                    </Link>
                    <Link href={route().has('settings') ? route('settings') : '#'} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white dark:text-gray-500">
                        <Icon icon="lucide:settings" className="text-base text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                    </Link>

                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    <Icon icon="lucide:log-out" className="text-base" />
                    <span>Log out</span>
                </Link>

            </div>
        </div>
    );
}
