'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/shared';
import {
    Plus, ShoppingCart, Package, Users, TrendingUp,
    Clock, CheckCircle, XCircle, Loader
} from 'lucide-react';

interface Stats {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
}

interface RecentOrder {
    _id: string;
    user?: { name: string; email: string };
    guestName?: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: { name: string; quantity: number }[];
}

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3 h-3" />,
    PROCESSING: <Loader className="w-3 h-3 animate-spin" />,
    DELIVERED: <CheckCircle className="w-3 h-3" />,
    CANCELLED: <XCircle className="w-3 h-3" />,
};

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes, usersRes] = await Promise.all([
                fetch('/api/admin/orders'),
                fetch('/api/admin/products'),
                fetch('/api/admin/users'),
            ]);

            const [orders, products, users] = await Promise.all([
                ordersRes.ok ? ordersRes.json() : [],
                productsRes.ok ? productsRes.json() : [],
                usersRes.ok ? usersRes.json() : [],
            ]);

            const totalSales = orders.reduce(
                (sum: number, o: any) => sum + (o.totalAmount || 0), 0
            );

            setStats({
                totalSales,
                totalOrders: orders.length,
                totalProducts: products.length,
                totalUsers: users.length,
            });

            setRecentOrders(orders.slice(0, 7));
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Sales',
            value: stats ? `৳${stats.totalSales.toLocaleString()}` : '—',
            icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
        },
        {
            label: 'Total Orders',
            value: stats ? stats.totalOrders.toLocaleString() : '—',
            icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />,
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            iconBg: 'bg-indigo-100',
        },
        {
            label: 'Total Products',
            value: stats ? stats.totalProducts.toLocaleString() : '—',
            icon: <Package className="w-5 h-5 text-emerald-600" />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
        },
        {
            label: 'Total Users',
            value: stats ? stats.totalUsers.toLocaleString() : '—',
            icon: <Users className="w-5 h-5 text-orange-600" />,
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            iconBg: 'bg-orange-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className={`bg-white rounded-xl shadow-sm p-5 border ${card.border} flex items-center gap-4`}
                    >
                        <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                            {loading ? (
                                <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mt-1" />
                            ) : (
                                <h3 className="text-xl font-black text-gray-900 mt-0.5">{card.value}</h3>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-800">Recent Orders</h3>
                    <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                    >
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="divide-y divide-gray-50">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4">
                                <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                                <div className="h-4 bg-gray-100 rounded w-32 animate-pulse flex-1" />
                                <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                                <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-medium">No orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/orders?orderId=${order._id}`}
                                                className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                ...{order._id.slice(-6).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {order.user?.name || order.guestName || 'Guest'}
                                            </p>
                                            {order.user?.email && (
                                                <p className="text-xs text-gray-400">{order.user.email}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ৳{order.totalAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-BD', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_ICONS[order.status]}
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
