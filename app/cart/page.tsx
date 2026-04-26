'use client';

import Navbar from '@/components/Navbar';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/shared';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, Search, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 p-12 text-center border border-gray-100">
                        <div className="h-24 w-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-12 w-12" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 font-medium mb-8">Looks like you haven't added any tech to your list yet.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/" className="w-full sm:w-auto">
                                <Button className="w-full sm:px-8 py-6 h-auto rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase text-xs tracking-[0.2em]">Continue Shopping</Button>
                            </Link>
                            <Link href="/track-order" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:px-8 py-6 h-auto rounded-2xl border-2 font-black uppercase text-xs tracking-[0.2em] gap-2">
                                    <Search className="h-4 w-4" /> Track Existing Order
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        <div className="bg-white rounded-lg shadow lg:col-span-7">
                            <ul className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <li key={item._id} className="flex py-6 px-4 sm:px-6">
                                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden relative">
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="w-full h-full object-center object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>
                                                        <Link href={`/products/${item.slug}`}>{item.name}</Link>
                                                    </h3>
                                                    <p className="ml-4">৳{item.price * item.quantity}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">Unit Price: ৳{item.price}</p>
                                            </div>
                                            <div className="flex-1 flex items-end justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md"
                                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <span className="px-3 py-1 font-bold text-gray-900 border-y h-8 flex items-center bg-gray-50 border-gray-100">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-md"
                                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow mt-16 lg:mt-0 lg:col-span-5 p-6 space-y-4">
                            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

                            <div className="flex justify-between text-base font-medium text-gray-900 pt-4 border-t">
                                <p>Subtotal</p>
                                <p>৳{total()}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Shipping and taxes calculated at checkout.</p>

                            <div className="pt-4">
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full py-3">Proceed to Checkout</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
