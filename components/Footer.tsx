'use client';

import Link from 'next/link';
import { Mail, Phone, Clock, MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-3 group">
                            <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Rahman Regnum Centre, Level-6,<br />
                                191/1, Tejgaon C/A, Dhaka-1208,<br />
                                Bangladesh
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-gray-600">+8809613444455</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-gray-600">9 am - 9 pm (Everyday)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-gray-600">customer.care@electromart.com</p>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Follow us on</p>
                            <div className="flex gap-3">
                                <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                                    <Facebook className="w-4 h-4" />
                                </Link>
                                <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                                    <span className="text-[10px] font-bold">BK</span>
                                </Link>
                                <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                                    <Youtube className="w-4 h-4" />
                                </Link>
                                <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white transition-all">
                                    <Linkedin className="w-4 h-4" />
                                </Link>
                                <Link href="#" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                                    <Instagram className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Gadget Bazar BD</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">About Us</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Gadget Bazar BD Blog</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Join our Affiliate Program</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Cookies Policy</Link></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Customer Care</h3>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Returns & Refunds</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Warranty Policy</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Help Center</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">Terms & Conditions</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">EMI Policy</Link></li>
                        </ul>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Payment Methods</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center   overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer group">
                                <span className="text-[10px] font-black text-[#ED1C24] uppercase italic group-hover:scale-110 transition-transform">Nagad</span>
                            </div>
                            <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer group">
                                <span className="text-[10px] font-black text-[#D12053] uppercase italic group-hover:scale-110 transition-transform">bKash</span>
                            </div>
                            <div className="h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-pointer group">
                                <span className="text-[10px] font-black text-[#D12053] uppercase italic group-hover:scale-110 transition-transform">Cash on delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} Gadget Bazar BD. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/track-order" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Track Order</Link>
                        <Link href="/auth/login" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Member Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
