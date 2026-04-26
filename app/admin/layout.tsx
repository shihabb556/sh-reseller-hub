'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Package, Users, ShoppingCart, LogOut, ListTree, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, Button } from '@/components/ui/shared';

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: ListTree,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: ListTree,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on path change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center justify-center border-b">
                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
            </div>
            <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}

                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center justify-start space-x-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8 font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </Button>
            </nav>
        </>
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white shadow-md hidden md:block">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 md:hidden",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 md:px-8">
                    <div className="flex items-center md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <span className="ml-2 font-bold text-indigo-600">Admin</span>
                    </div>
                    <div className="flex items-center space-x-4 ml-auto">
                        <span className="text-sm text-gray-700 hidden sm:block">
                            Welcome, {session?.user?.name || 'Admin'}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {session?.user?.name?.[0] || 'A'}
                        </div>
                    </div>
                </header>
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
