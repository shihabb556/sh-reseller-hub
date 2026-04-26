// Meta Pixel (Facebook Pixel) utility
// Usage: import { trackEvent } from '@/lib/pixel';

declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        _fbq?: any;
    }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/** Fire a Meta Pixel standard event */
export const trackEvent = (event: string, params?: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', event, params);
};

/** Fire a Meta Pixel custom event */
export const trackCustomEvent = (event: string, params?: Record<string, any>) => {
    if (typeof window === 'undefined' || !window.fbq) return;
    window.fbq('trackCustom', event, params);
};

/* ──────────────────────────────────────────
   Convenience helpers for standard events
────────────────────────────────────────── */

export const pixelPageView = () => trackEvent('PageView');

export const pixelViewContent = (params: {
    content_ids: string[];
    content_name: string;
    content_type?: string;
    value?: number;
    currency?: string;
}) => trackEvent('ViewContent', { content_type: 'product', currency: 'BDT', ...params });

export const pixelAddToCart = (params: {
    content_ids: string[];
    content_name: string;
    value: number;
    currency?: string;
}) => trackEvent('AddToCart', { content_type: 'product', currency: 'BDT', ...params });

export const pixelInitiateCheckout = (params: {
    value: number;
    num_items: number;
    currency?: string;
}) => trackEvent('InitiateCheckout', { currency: 'BDT', ...params });

export const pixelPurchase = (params: {
    value: number;
    num_items: number;
    order_id?: string;
    currency?: string;
}) => trackEvent('Purchase', { currency: 'BDT', ...params });

export const pixelCompleteRegistration = () =>
    trackEvent('CompleteRegistration', { status: true });

export const pixelSearch = (search_string: string) =>
    trackEvent('Search', { search_string });

export const pixelAddToWishlist = (params: {
    content_ids: string[];
    content_name: string;
    value?: number;
}) => trackEvent('AddToWishlist', { content_type: 'product', currency: 'BDT', ...params });
