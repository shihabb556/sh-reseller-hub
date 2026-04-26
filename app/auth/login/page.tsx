'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui/shared';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Countdown Timer Effect
    useEffect(() => {
        if (!lockedUntil) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = lockedUntil - now;

            if (diff <= 0) {
                setLockedUntil(null);
                setError('');
                clearInterval(timer);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`
                );
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [lockedUntil]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                if (res.error.startsWith('LOCKOUT|')) {
                    const [, timestamp, message] = res.error.split('|');
                    setLockedUntil(parseInt(timestamp));
                    setError(message || 'Account locked due to too many failed attempts.');
                } else {
                    setError(res.error);
                }
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    {registered && (
                        <div className="mt-2 text-center text-sm text-green-600 bg-green-50 p-2 rounded">
                            Account created successfully. Please login.
                        </div>
                    )}
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className={`p-4 rounded-xl text-sm text-center font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${lockedUntil ? 'bg-red-50 text-red-600 border border-red-100' : 'text-red-500'}`}>
                            {lockedUntil && (
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 10h10M5 21h14a2 2 0 002-2V11a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs uppercase tracking-widest opacity-70">Security Lockout</span>
                                </div>
                            )}
                            {error}
                            {lockedUntil && (
                                <div className="mt-3 py-2 bg-white rounded-lg border border-red-100 shadow-sm inline-block px-4">
                                    <span className="text-gray-400 text-[10px] uppercase font-black block mb-1">Time Remaining</span>
                                    <span className="text-red-600 font-mono text-xl tabular-nums">{timeLeft}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            disabled={loading || !!lockedUntil}
                            className={`group relative flex w-full justify-center rounded-xl py-3 px-4 text-xs font-black uppercase tracking-widest transition-all duration-300 ${lockedUntil ? 'bg-gray-100 text-gray-400! border-gray-200 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white! hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                        >
                            {loading ? 'Processing...' : lockedUntil ? 'Locked' : 'Sign in'}
                        </Button>
                        {lockedUntil && (
                            <p className="mt-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                For security reasons, this sign-in method is temporarily disabled.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
