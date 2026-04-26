'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/shared';
import { Search, Package, MapPin, Clock, CreditCard, Download, Printer } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const summaryRef = useRef<HTMLDivElement>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const res = await fetch(`/api/orders/${orderId.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                const data = await res.json();
                setError(data.message || 'Order not found');
            }
        } catch (err) {
            setError('Failed to track order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadSummary = async () => {
        if (!summaryRef.current) return;
        import('react-hot-toast').then(async ({ toast }) => {
            const toastId = toast.loading('Preparing your receipt...');
            try {
                const element = summaryRef.current;
                if (!element) throw new Error('Summary element not found');

                const originalWidth = element.style.width;
                element.style.width = '800px';

                const dataUrl = await htmlToImage.toPng(element, {
                    backgroundColor: '#ffffff',
                    quality: 1,
                    pixelRatio: 2,
                    cacheBust: true,
                    skipFonts: true,
                    style: {
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        width: '800px'
                    }
                });

                element.style.width = originalWidth;

                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`e-receipt-${orderId?.slice(-6).toUpperCase()}.pdf`);

                toast.success('Receipt downloaded successfully!', { id: toastId });
            } catch (err) {
                console.error('Download error:', err);
                toast.error('Download failed. Please try again.', { id: toastId });
            }
        });
    };

    const getStatusStep = (status: string) => {
        const steps = ['PENDING', 'PROCESSING', 'DELIVERED'];
        return steps.indexOf(status) + 1;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic mb-4">Track Your Order</h1>
                    <p className="text-gray-500 font-medium">Enter your Order ID to see real-time status updates.</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 mb-8">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Order ID (e.g. 5f7d2b...)"
                                className="w-full bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-500 focus:ring-0 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 h-auto rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs"
                        >
                            {loading ? 'Searching...' : 'Track Now'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {order && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadSummary}
                                className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Printer className="h-4 w-4" /> Print PDF
                            </Button>
                        </div>

                        <div ref={summaryRef} className="space-y-6">
                            {/* Status Tracker */}
                            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase italic underline decoration-blue-500 decoration-4">
                                            {order.status}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                                        <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-1000 hidden md:block"
                                        style={{ width: `${((getStatusStep(order.status) - 1) / 2) * 100}%` }}
                                    ></div>

                                    <div className="relative flex flex-col md:flex-row justify-between gap-8">
                                        {['PENDING', 'PROCESSING', 'DELIVERED'].map((step, idx) => {
                                            const currentStep = getStatusStep(order.status);
                                            const isActive = idx + 1 <= currentStep;

                                            return (
                                                <div key={step} className="flex flex-row md:flex-col items-center gap-4 md:gap-4 flex-1">
                                                    <div className={`
                                                        h-12 w-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500
                                                        ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-gray-100 text-gray-400'}
                                                    `}>
                                                        {idx === 0 && <Clock className="h-6 w-6" />}
                                                        {idx === 1 && <Package className="h-6 w-6" />}
                                                        {idx === 2 && <MapPin className="h-6 w-6" />}
                                                    </div>
                                                    <div className="text-left md:text-center">
                                                        <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                                                            {step}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-medium">
                                                            {idx === 0 && 'Awaiting Confirmation'}
                                                            {idx === 1 && 'Preparing your package'}
                                                            {idx === 2 && 'Successfully Handed Over'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-left">
                                    <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6">Order Items</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item: any) => (
                                            <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                                        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="p-3 text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 uppercase truncate max-w-[150px]">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Qty: {item.quantity} × ৳{item.price}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                        <div className="pt-4 flex justify-between items-center border-t-2 border-dashed border-gray-100">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                            <p className="text-2xl font-black text-blue-600">৳{order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-left">
                                    <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6">Payment & Shipping</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${order.paymentStatus?.advancePaid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <CreditCard className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Advance Payment</p>
                                                <p className={`text-sm font-bold uppercase ${order.paymentStatus?.advancePaid ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {order.paymentStatus?.advancePaid ? 'Verified' : 'Pending Confirmation'}
                                                </p>
                                            </div>
                                        </div>

                                        {order.paymentStatus?.trxId && (
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction ID</p>
                                                <p className="text-sm font-mono font-bold text-gray-900 break-all select-all">
                                                    {order.paymentStatus.trxId}
                                                </p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Notice</p>
                                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                                Our team will review your payment within 24 hours. For urgent queries, call 01620-919681.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
