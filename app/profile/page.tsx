'use client';

import Navbar from '@/components/Navbar';
import { useEffect, useState, Suspense, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/shared';
import * as htmlToImage from 'html-to-image';
import { Download, Package } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { profileSchema, ProfileInput } from '@/lib/validations';

function ProfileContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const orderSuccess = searchParams.get('orderSuccess');
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState<ProfileInput & { email: string }>({
        name: '',
        lastName: '',
        email: '',
        primaryPhone: '',
        secondaryPhone: '',
        village: '',
        thana: '',
        district: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileInput, string>>>({});
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'profile'
    const [searchTerm, setSearchTerm] = useState('');
    const summaryRef = useRef<HTMLDivElement>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const downloadSummary = async (order: any) => {
        setSelectedOrder(order);
        import('react-hot-toast').then(async ({ toast }) => {
            const toastId = toast.loading('Preparing your receipt...');
            // Wait for DOM to render the hidden template
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!summaryRef.current) {
                toast.error('Failed to initialize download template.', { id: toastId });
                setSelectedOrder(null);
                return;
            }

            try {
                const element = summaryRef.current;
                const originalWidth = element.style.width;
                element.style.width = '800px';

                const dataUrl = await htmlToImage.toPng(element, {
                    backgroundColor: '#ffffff',
                    quality: 1,
                    pixelRatio: 2,
                    cacheBust: true,
                    skipFonts: true, // Fix for "trim" error
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
                pdf.save(`e-receipt-${order._id.slice(-6).toUpperCase()}.pdf`);

                toast.success('Receipt downloaded successfully!', { id: toastId });
            } catch (err) {
                console.error('Download error:', err);
                toast.error('Download failed. Please try again.', { id: toastId });
            } finally {
                setSelectedOrder(null);
            }
        });
    };

    const filteredOrders = orders.filter((order: any) =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (session) {
            fetchOrders();
            fetchProfile();
        }
    }, [session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/user/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.name || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    primaryPhone: data.primaryPhone || '',
                    secondaryPhone: data.secondaryPhone || '',
                    village: data.village || '',
                    thana: data.thana || '',
                    district: data.district || ''
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFieldErrors({});

        // Frontend validation
        const result = profileSchema.safeParse(profile);
        if (!result.success) {
            const errors: any = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path[0]] = issue.message;
            });
            setFieldErrors(errors);
            setSaving(false);
            import('react-hot-toast').then(({ toast }) => toast.error('Please fix the errors in the form'));
            return;
        }

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                import('react-hot-toast').then(({ toast }) => toast.success('Profile updated successfully'));
            } else {
                const data = await res.json();
                import('react-hot-toast').then(({ toast }) => toast.error(data.message || 'Failed to update profile'));
            }
        } catch (error) {
            import('react-hot-toast').then(({ toast }) => toast.error('Error updating profile'));
        } finally {
            setSaving(false);
        }
    };

    if (!session) return null;

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-12">
                <Navbar />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {orderSuccess && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 font-medium">
                                        Order placed successfully! We will contact you soon for confirmation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New Profile Header Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-100/20 border border-gray-100 mb-10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-48 w-48 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-700"></div>

                        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Avatar Section */}
                            <div className="relative">
                                <div className="h-32 w-32 md:h-40 md:w-40 bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden group/avatar">
                                    <div className="h-full w-full flex items-center justify-center text-gray-200">
                                        <svg className="h-20 w-20 md:h-24 md:w-24" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className="absolute bottom-2 right-2 h-10 w-10 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group-hover/avatar:translate-y-0 translate-y-2 opacity-0 group-hover/avatar:opacity-100 duration-300"
                                    >
                                        <svg className="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                                {/* Fixed Camera Icon Always Visible like mockup */}
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className="absolute bottom-0 right-0 h-9 w-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 transition-all active:scale-95 z-10"
                                >
                                    <svg className="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                                    {profile.name} {profile.lastName}
                                </h1>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-gray-400 tracking-tight">{profile.primaryPhone || 'No Phone Added'}</p>
                                    <p className="text-base font-medium text-gray-400 opacity-80">{profile.email}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('profile')}
                                        className="h-10 px-6 rounded-full bg-gray-50 border-gray-100 text-xs font-black uppercase tracking-widest hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                                    >
                                        Edit Profile
                                    </Button>
                                    <button
                                        className="text-xs font-black uppercase tracking-widest text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                    >
                                        My Voucher
                                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Center</h1>
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mt-4 md:mt-0 gap-1">
                            <Button
                                variant={activeTab === 'orders' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('orders')}
                                size="sm"
                                className="rounded-lg transition-all"
                            >
                                Order History
                            </Button>
                            <Button
                                variant={activeTab === 'profile' ? 'default' : 'outline'}
                                onClick={() => setActiveTab('profile')}
                                size="sm"
                                className="rounded-lg transition-all"
                            >
                                Profile Details
                            </Button>
                        </div>
                    </div>

                    {activeTab === 'orders' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search by Order ID or Status..."
                                        className="w-full pl-10 pr-4 py-2 text-sm border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-0 transition-all font-medium bg-gray-50/50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-500 font-medium">Loading your orders...</p>
                                </div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="bg-indigo-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-900 font-bold text-xl">{searchTerm ? 'No matching orders found' : 'No orders yet'}</p>
                                    <p className="mt-2 text-gray-500">
                                        {searchTerm ? `We couldn't find any orders matching "${searchTerm}"` : 'When you purchase items, they will appear here.'}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/'}
                                            className="mt-6"
                                        >
                                            Start Shopping
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <div key={order._id} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-2xl border border-gray-100 mb-6">
                                        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-bold text-gray-900 uppercase">
                                                        Order #{order._id.slice(-6)}
                                                    </h3>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full tracking-wide ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 font-medium italic">
                                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <p className="text-2xl font-black text-indigo-600">৳{order.totalAmount}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Total (Inc. ৳{order.deliveryCharge || 0} Delivery)</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => downloadSummary(order)}
                                                    className="h-10 w-10 p-0 text-gray-400 hover:text-indigo-600 rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:scale-110 active:scale-95"
                                                    title="Download Summary"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="px-6 py-6 lg:flex lg:gap-12">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Ordered Items</h4>
                                                <ul className="space-y-4">
                                                    {order.items.map((item: any) => (
                                                        <li key={item._id} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                                                                    {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-6 w-6 text-gray-300">📦</div>}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="mt-8 lg:mt-0 lg:w-72 bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200">
                                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Verification Info</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-bold uppercase">Advance Status</p>
                                                        <p className={`text-sm font-bold mt-1 ${order.paymentStatus.advancePaid ? 'text-green-600' : 'text-amber-600 animate-pulse'}`}>
                                                            {order.paymentStatus.advancePaid ? '✅ VERIFIED' : '⏳ PENDING'}
                                                        </p>
                                                    </div>
                                                    {order.paymentStatus.trxId && (
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase">Transaction ID</p>
                                                            <p className="text-sm font-mono font-bold bg-white px-2 py-1 rounded inline-block mt-1 border border-gray-200">
                                                                {order.paymentStatus.trxId}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-8 md:px-10">
                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-4 border-gray-100">Personal Information</h3>
                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.name && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={profile.lastName}
                                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.lastName && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    readOnly
                                                    value={profile.email}
                                                    className="block w-full rounded-xl border-gray-200 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
                                                />
                                                <p className="mt-2 text-xs text-gray-400">Email cannot be changed.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-4 border-gray-100">Contact & Address</h3>
                                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Primary Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="017XXXXXXXX"
                                                    value={profile.primaryPhone}
                                                    onChange={(e) => setProfile({ ...profile, primaryPhone: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.primaryPhone ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.primaryPhone && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.primaryPhone}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Secondary Phone (Optional)</label>
                                                <input
                                                    type="tel"
                                                    placeholder="018XXXXXXXX"
                                                    value={profile.secondaryPhone}
                                                    onChange={(e) => setProfile({ ...profile, secondaryPhone: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.secondaryPhone ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.secondaryPhone && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.secondaryPhone}</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Village / Ward / Road</label>
                                                <input
                                                    type="text"
                                                    placeholder="House 12, Road 5, Block B"
                                                    value={profile.village}
                                                    onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.village ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.village && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.village}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Thana / Sub-district</label>
                                                <input
                                                    type="text"
                                                    value={profile.thana}
                                                    onChange={(e) => setProfile({ ...profile, thana: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.thana ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.thana && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.thana}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
                                                <input
                                                    type="text"
                                                    value={profile.district}
                                                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                                                    className={`block w-full rounded-xl border ${fieldErrors.district ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-3 text-sm focus:border-indigo-600 focus:bg-white focus:ring-0 transition-all font-medium`}
                                                />
                                                {fieldErrors.district && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.district}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="gap-2 px-8 py-3 rounded-xl shadow-lg shadow-indigo-100"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div>
                                                    Saving Changes...
                                                </>
                                            ) : 'Update Account'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Hidden Summary Template for Download */}
            <div className="fixed left-[-9999px] top-0">
                {selectedOrder && (
                    <div
                        ref={summaryRef}
                        className="bg-white p-10 w-[800px] border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-indigo-600 italic uppercase">ELECTROMART</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Official Order Summary</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-900 uppercase">Order ID</p>
                                <p className="text-sm font-mono font-medium text-gray-500">#{selectedOrder._id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-dashed border-gray-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Info</p>
                                <p className="text-sm font-bold text-gray-900">{selectedOrder.user?.name || profile.name || 'Valued Customer'}</p>
                                <p className="text-xs text-gray-500 font-medium">{selectedOrder.user?.email || profile.email || 'customer@example.com'}</p>
                                <p className="text-xs text-gray-500 font-medium">{selectedOrder.shippingAddress?.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    {selectedOrder.shippingAddress?.village}, {selectedOrder.shippingAddress?.thana}<br />
                                    {selectedOrder.shippingAddress?.district}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Items Ordered</p>
                            <div className="space-y-4">
                                {selectedOrder.items.map((item: any) => (
                                    <div key={item.name} className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-gray-300" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase">{item.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Qty: {item.quantity} × ৳{item.price}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-gray-900">৳{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrder.deliveryCharge > 0 && (
                            <div className="flex justify-between items-center mb-6 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Fee ({selectedOrder.deliveryArea})</p>
                                <p className="text-sm font-black text-gray-900">৳{selectedOrder.deliveryCharge}</p>
                            </div>
                        )}

                        <div className="bg-indigo-600 p-8 rounded-3xl text-white flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Payable</p>
                                <p className="text-sm font-medium opacity-60">Status: {selectedOrder.status}</p>
                            </div>
                            <p className="text-4xl font-black italic">৳{selectedOrder.totalAmount}</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
