import { z } from 'zod';

/** Standard Bangladeshi Phone Number Regex: 013-019 followed by 8 digits */
export const phoneRegex = /^01[3-9]\d{8}$/;

/** Registration Schema */
export const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(60, 'Name too long')
        .trim(),
    email: z.string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters'),
});

/** Profile Schema */
export const profileSchema = z.object({
    name: z.string().min(2, 'First name is too short').max(60).trim(),
    lastName: z.string().max(60).trim().optional(),
    primaryPhone: z.string().regex(phoneRegex, 'Invalid phone number format').optional(),
    secondaryPhone: z.string().regex(phoneRegex, 'Invalid secondary phone number format').optional().or(z.literal('')),
    village: z.string().max(200, 'Village name too long').trim().optional(),
    thana: z.string().max(100, 'Thana name too long').trim().optional(),
    district: z.string().max(100, 'District name too long').trim().optional(),
});

/** Shipping Address Schema (used in Checkout) */
export const shippingAddressSchema = z.object({
    street: z.string().max(200).trim().optional(),
    city: z.string().max(100).trim().optional(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
    village: z.string().min(2, 'Village/Area is required').max(200).trim(),
    thana: z.string().min(2, 'Thana/Upazila is required').max(100).trim(),
    district: z.string().min(2, 'District is required').max(100).trim(),
    secondaryPhone: z.string().regex(phoneRegex, 'Invalid secondary phone number format').optional().or(z.literal('')),
});

/** Order Schema (used in Checkout API) */
export const orderSchema = z.object({
    items: z.array(z.any()).min(1, 'No items in order'),
    shippingAddress: shippingAddressSchema,
    trxId: z.string().optional(),
    deliveryArea: z.enum(['Inside Dhaka', 'Outside Dhaka']),
    guestEmail: z.string().email('Invalid email address').optional(),
    guestName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
