import { Link, usePage, Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * AdminLayout
 * - Floating (not flush) sidebar that can be pinned/unpinned
 * - Compact sticky topbar with ThemeToggle (icon variant)
 * - Works with Tailwind + dark mode
 * - Mobile: off‑canvas with backdrop
 * - Desktop: detached "card" sidebar that does not shift page width
 * - Keyboard: [Ctrl/Cmd + b] toggles sidebar
 *
 * Usage: export default (page) => <AdminLayout title="Dashboard" header={<h1>Dashboard</h1>}>{page}</AdminLayout>
 */
export default function AdminLayout({ title, header, children }) {
    const { props } = usePage();
    const user = props?.auth?.user;
    const permissions = props?.auth?.permissions || [];
    const { theme, isDark } = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarPinned, setSidebarPinned] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin.sidebarPinned') ?? 'true'); } catch { return true; }
    });

    // Persist pin preference
    useEffect(() => {
        try { localStorage.setItem('admin.sidebarPinned', JSON.stringify(sidebarPinned)); } catch { }
    }, [sidebarPinned]);

    // Keyboard shortcut
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setSidebarOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Demo nav: replace with your app links
    const nav = useMemo(
        () => [
            {
                name: 'Dashboard',
                routeName: 'admin.dashboard',
                icon: 'lucide:layout-dashboard',
                perm: ['manage-branches', 'manage-org-units', 'manage-programs'],
            },
            {
                name: 'Universities',
                routeName: 'admin.universities.index',
                icon: 'lucide:buildings-2',
                perm: 'manage-universities',
            },
            {
                name: 'Branches',
                routeName: 'admin.branches.index',
                icon: 'lucide:git-branch',
                perm: ['manage-branches', 'view-branches'],
            },
            {
                name: 'Org Units',
                routeName: 'admin.org-units.index',
                icon: 'lucide:network',
                perm: ['manage-org-units', 'view-org-units'],
            },
            {
                name: 'Programs',
                routeName: 'admin.programs.index',
                icon: 'lucide:notebook-tabs',
                perm: ['manage-programs', 'view-programs'],
            },
            {
                name: 'Curricula',
                routeName: 'admin.curricula.index',
                icon: 'lucide:list-checks',
                perm: ['manage-curricula', 'view-curricula'],
            },
        ],
        [],
    );

    const can = (perm) => {
        if (!perm) return true;
        if (Array.isArray(perm)) {
            return perm.some((rule) => permissions.includes(rule));
        }

        return permissions.includes(perm);
    };

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

            {/* Detached Sidebar container */}
            <Sidebar
                nav={nav.filter((n) => can(n.perm))}
                open={sidebarOpen}
                pinned={sidebarPinned}
                onClose={() => setSidebarOpen(false)}
                onPinToggle={() => setSidebarPinned((v) => !v)}
            />

            {/* Main content wrapper */}
            <main className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-10">
                {header && (
                    <div className="mb-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Admin</div>
                            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{header}</div>
                        </div>
                        {/* Quick theme access (example: icon variant, small) */}
                        <ThemeToggle variant="icon" size="sm" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" />
                    </div>
                )}

                <div className="grid gap-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function Topbar({ user, onMenu }) {
    return (
        <header className="fixed top-0 inset-x-0 z-40 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Mobile menu button */}
                    <button onClick={onMenu} className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none" aria-label="Open menu">
                        <Icon icon="lucide:panel-left-open" className="text-xl" />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/assets/logo-full.png" alt="Logo" className="block dark:hidden h-7" />
                        <img src="/assets/logo-full-dark.png" alt="Logo" className="hidden dark:block h-7" />
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    {/* Theme toggle (icon) */}
                    <ThemeToggle variant="icon" size="sm" className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800" />

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

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden="true"
            />

            {/* Floating card sidebar */}
            <aside
                ref={panelRef}
                className={`fixed z-50 top-20 left-4 w-72 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white/85 dark:bg-gray-900/85 backdrop-blur transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-[130%]'} lg:translate-x-0`}
                role="dialog"
                aria-label="Navigation"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Icon icon="lucide:compass" />
                        <span>Admin Navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onPinToggle} className={`hidden lg:inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs border ${pinned ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                            <Icon icon={pinned ? 'lucide:pin' : 'lucide:pin-off'} />
                            {pinned ? 'Pinned' : 'Unpinned'}
                        </button>
                        <button onClick={onClose} className="lg:hidden inline-flex rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
                            <Icon icon="lucide:x" />
                        </button>
                    </div>
                </div>

                <nav className="overflow-y-auto py-2">
                    {nav.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>

                <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/60 dark:to-gray-900/60">
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
    const hasRoute = item.routeName ? route().has(item.routeName) : false;
    const href = hasRoute ? route(item.routeName) : item.href ?? '#';
    const isActive = item.routeName ? route().current(item.routeName) : false;
    return (
        <Link
            href={href}
            className={`group mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        >
            <Icon icon={item.icon} className="text-lg shrink-0" />
            <span className="text-sm text-gray-800 dark:text-gray-200">{item.name}</span>
            {isActive && <span className="ms-auto text-[10px] rounded-md px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">active</span>}
        </Link>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function onDown(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); }
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                <img src={user?.profile_photo_url || '/assets/avatar.png'} alt="Avatar" className="h-7 w-7 rounded-full object-cover" />
                <Icon icon="lucide:chevron-down" className="text-base" />
            </button>
            <div className={`absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl transition ${open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'}`}>
                <div className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Account'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800" />
                <div className="py-1">
                    <Link href={route().has('profile.show') ? route('profile.show') : '#'} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Profile</Link>
                    <Link href={route().has('notifications.index') ? route('notifications.index') : '#'} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Notifications</Link>
                    <Link href={route().has('settings') ? route('settings') : '#'} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Settings</Link>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800" />
                <form method="post" action={route().has('logout') ? route('logout') : '#'}>
                    {/* Inertia handles CSRF automatically if you include @vite/react + Ziggy */}
                    <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Log out</button>
                </form>
            </div>
        </div>
    );
}
