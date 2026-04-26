'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Heart, User, Search, Flag, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import { Button, Input } from './ui/shared';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const cartItems = useCartStore((state) => state.items);
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                <Flag className="h-6 w-6" fill="currentColor" />
                            </div>
                            <div className="hidden md:block">
                                <span className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">Gadget Bazar BD</span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/track-order" className="text-sm font-black text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                                Track Order
                            </Link>
                        </div>
                    </div>


                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-8 relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                            type="search"
                            placeholder="Search gadgets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-full pl-11 pr-4 py-2 text-sm transition-all"
                        />
                    </form>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-600 hover:bg-gray-50 rounded-full transition-colors hidden sm:flex"
                        >
                            <Heart className="h-6 w-6" />
                        </Button> */}

                        <Link href="/cart" className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                            <ShoppingBag className="h-6 w-6" />
                            {mounted && totalItems > 0 && (
                                <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-blue-600 rounded-full border-2 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        <div className="relative" ref={profileRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <User className="h-6 w-6" />
                            </Button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                                    {session ? (
                                        <>
                                            <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                                <p className="text-sm font-black text-gray-900 truncate">Hello, {session.user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                            </div>
                                            <Link href="/track-order" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <Search className="h-4 w-4" /> Track Order
                                            </Link>
                                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <User className="h-4 w-4" /> My Profile
                                            </Link>
                                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <Package className="h-4 w-4" /> My Orders
                                            </Link>
                                            {session.user.role === 'ADMIN' && (
                                                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                                                    <Settings className="h-4 w-4" /> Admin Dashboard
                                                </Link>
                                            )}
                                            <div className="border-t border-gray-50 mt-2 pt-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => signOut()}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold justify-start"
                                                >
                                                    <LogOut className="h-4 w-4" /> Logout
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 space-y-3">
                                            <p className="text-sm text-gray-500 font-medium mb-2">Welcome to ElectroMart</p>
                                            <Link href="/auth/login" className="block">
                                                <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-5 font-black uppercase text-xs tracking-widest">Login</Button>
                                            </Link>
                                            <Link href="/auth/register" className="block text-center text-xs text-gray-400 font-bold hover:text-blue-600 transition-colors">
                                                Don't have an account? Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="flex items-center md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2.5 rounded-full text-gray-600 hover:bg-gray-50 focus:outline-none"
                            >
                                {isMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search - Only visible on small screens */}
            <div className="md:hidden px-4 pb-4">
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                        type="search"
                        placeholder="Search gadgets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm transition-all shadow-sm"
                    />
                </form>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-4 duration-300">
                    <div className="px-4 pt-4 pb-6 space-y-1">
                        <Link href="/" className="block px-4 py-3 text-base font-black text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                            Home
                        </Link>
                        <Link href="/track-order" className="block px-4 py-3 text-base font-black text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                            Track Order
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
