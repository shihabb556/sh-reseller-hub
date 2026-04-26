'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/shared';
import { CheckCircle, Download, Package, ArrowRight, Printer, Loader2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        } else {
            router.push('/');
        }
    }, [orderId]);

    // Auto-download effect
    useEffect(() => {
        if (order && summaryRef.current) {
            const timer = setTimeout(() => {
                downloadSummary();
            }, 2000); // 2 second delay to let things render
            return () => clearTimeout(timer);
        }
    }, [order]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const downloadSummary = async () => {
        if (!summaryRef.current || downloading) return;

        setDownloading(true);
        const toastId = toast.loading('Preparing your receipt...');

        try {
            // Give a tiny bit of time for any pending renders
            await new Promise(resolve => setTimeout(resolve, 500));

            const element = summaryRef.current;
            const originalWidth = element.style.width;

            // Force a fixed width for stable rendering during capture
            element.style.width = '800px';

            const dataUrl = await htmlToImage.toPng(element, {
                backgroundColor: '#ffffff',
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: true, // Re-enabled to fix "trim" error
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    width: '800px'
                }
            });

            // Restore original width
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
            toast.error('Auto-download failed. Please use the Print button.', { id: toastId });
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                <p className="font-bold uppercase tracking-widest text-xs">Generating Your Receipt...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 ring-8 ring-green-50">
                        <CheckCircle className="h-12 w-12 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 font-medium mb-4">Your e-receipt is being generated and will download automatically.</p>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl inline-block mb-10">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                        Note: Please keep this receipt for verification during delivery.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button
                        size="lg"
                        onClick={downloadSummary}
                        disabled={downloading}
                        className="rounded-2xl gap-2 font-black uppercase tracking-widest text-xs h-14 shadow-lg shadow-indigo-100 min-w-[240px]"
                    >
                        {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        {downloading ? 'Downloading...' : 'Download Receipt (PDF)'}
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => window.print()}
                        className="rounded-2xl gap-2 font-black uppercase tracking-widest text-xs h-14 bg-white"
                    >
                        <Printer className="h-4 w-4" /> Print PDF
                    </Button>
                </div>

                {/* E-Receipt Card for Download */}
                <div
                    ref={summaryRef}
                    className="bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 text-left overflow-hidden relative"
                >
                    {/* Watermark/Background Decoration */}
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-50 rounded-full opacity-30 pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-50 rounded-full opacity-30 pointer-events-none"></div>

                    {/* Receipt Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-4 border-blue-600 pb-8">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">
                                ELECTRO<br /> <span className="text-blue-500">MART</span>

                            </h1>
                            <div className="inline-block bg-blue-600 px-3 py-1 rounded-full">
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Official Order Summary</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right space-y-1">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Identifier</p>
                            <p className="text-xl font-mono font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 italic">
                                #{orderId?.split('-').pop()?.toUpperCase()}
                            </p>
                            {order && <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Date: {new Date(order.createdAt).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 my-12 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">BILL TO</p>
                            <p className="text-md font-black text-gray-900 uppercase">{order?.guestName || order?.user?.name || 'Valued Customer'}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">{order?.guestEmail || order?.user?.email || 'customer@example.com'}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">{order?.shippingAddress?.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3">SHIP TO</p>
                            <p className="text-xs text-gray-600 font-bold leading-relaxed uppercase">
                                {order?.shippingAddress?.village}, {order?.shippingAddress?.thana}<br />
                                {order?.shippingAddress?.district}
                            </p>
                        </div>
                    </div>

                    <div className="mb-12 relative z-10">
                        <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg mb-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                        </div>
                        <div className="space-y-6 px-2">
                            {order?.items.map((itemValue: any) => (
                                <div key={itemValue.name} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-1">
                                            {itemValue.image ? <img src={itemValue.image} alt={itemValue.name} className="h-full w-full object-cover rounded-lg" /> : <Package className="h-5 w-5 text-gray-300" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{itemValue.name}</p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mt-0.5">Qty: {itemValue.quantity} × ৳{itemValue.price}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 italic">৳{itemValue.price * itemValue.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Footer */}
                    <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="space-y-1 text-center sm:text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Total Payable Amount</p>
                            {order && <p className="text-xl font-bold italic">Status: <span className="underline decoration-2 underline-offset-4">{order.status}</span></p>}
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-5xl font-black italic tracking-tighter">৳{order?.totalAmount}</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-dashed border-gray-100 flex flex-col items-center relative z-10 text-center">
                        <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2 leading-relaxed">
                            Thank you for your business!
                        </p>
                        <p className="text-[9px] text-gray-300 font-bold italic">
                            For support or inquiries, email help@electromart.com or WhatsApp +880 1620-919681

                        </p>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="gap-2 font-bold text-gray-500 hover:text-indigo-600 rounded-xl transition-all"
                    >
                        Continue Shopping <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/track-order')}
                        className="gap-2 font-bold text-gray-500 hover:text-indigo-600 rounded-xl transition-all"
                    >
                        Track My Order <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 uppercase font-black tracking-widest text-xs">Loading Secure Receipt...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
