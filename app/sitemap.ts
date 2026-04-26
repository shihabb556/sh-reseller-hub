import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import { Product, Category } from '@/models/schema';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://gadgetbazarbd.com';

    // Static routes that don't depend on DB
    const staticRoutes = [
        '',
        '/cart',
        '/track-order',
        '/auth/login',
        '/auth/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.5,
    }));

    try {
        await dbConnect();

        // Fetch all active products
        const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
        const productEntries = products.map((product: any) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        // Fetch all active categories
        const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean();
        const categoryEntries = categories.map((category: any) => ({
            url: `${baseUrl}/?category=${category.slug}`,
            lastModified: category.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...productEntries, ...categoryEntries];
    } catch (error) {
        console.error('Failed to fetch data for sitemap, falling back to static routes:', error);
        // During build, if DB is not accessible (e.g. IP whitelist), return only static routes
        return staticRoutes;
    }
}
