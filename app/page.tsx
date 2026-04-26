import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import dbConnect from '@/lib/db';
import { Product, Category } from '@/models/schema';
import Link from 'next/link';
import { Button } from '@/components/ui/shared';
import { Search } from 'lucide-react';

import { Metadata } from 'next';

// Force dynamic because we want refreshed products
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ category?: string; search?: string }>
}): Promise<Metadata> {
  const params = await searchParams;
  let title = "Gadget Bazar BD - Premium Gadgets & Electronics Shop";
  let description = "Explore the best collection of gadgets and electronics at Gadget Bazar BD. Quality tech at unbeatable prices.";

  if (params.search) {
    title = `Search results for "${params.search}" | Gadget Bazar BD`;
  } else if (params.category) {
    title = `${params.category} Collection | Gadget Bazar BD`;
    description = `Shop the latest ${params.category} gadgets and electronics at Gadget Bazar BD. High-quality products with official warranty.`;
  }

  return {
    title,
    description,
  };
}

async function getProducts(params: {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
}) {
  await dbConnect();
  const query: any = { isActive: true };

  // Category filter
  if (params.category) {
    const categorySlugs = params.category.split(',');
    const categories = await Category.find({ slug: { $in: categorySlugs } });
    const categoryNames = categories.map(c => c.name);
    query.$or = [
      { category: { $in: categoryNames } },
      { subCategory: { $in: categoryNames } }
    ];
  }

  // Search filter
  if (params.search) {
    query.$or = [
      ...(query.$or || []),
      { name: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } }
    ];
  }

  // Price filter
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = Number(params.minPrice);
    if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
  }

  // Availability filter
  if (params.availability) {
    const statuses = params.availability.split(',');
    if (statuses.includes('In Stock') && !statuses.includes('Pre-order')) {
      query.stock = { $gt: 0 };
    } else if (statuses.includes('Pre-order') && !statuses.includes('In Stock')) {
      query.stock = { $eq: 0 };
    }
  }

  return Product.find(query).sort({ createdAt: -1 }).limit(40);
}

async function getCategories() {
  await dbConnect();
  // Fetch all active categories to support hierarchical display
  return Category.find({ isActive: true }).sort({ name: 1 });
}

export default async function Home({ searchParams }: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    availability?: string;
  }>
}) {
  const params = await searchParams;
  const products = await getProducts(params);
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MobileFilterDrawer categories={JSON.parse(JSON.stringify(categories))} />
        <div className="lg:flex gap-12 items-start">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block w-72 shrink-0">
            <FilterSidebar categories={JSON.parse(JSON.stringify(categories))} />
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Our Selection</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                  {params.search ? `Results for "${params.search}"` : params.category ? 'Category Items' : 'Explore Gadgets'}
                </h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Found {products.length} high-quality gadgets
                </p>
              </div>

              {/* Mobile Filter Trigger could go here in a real app, 
                  but we'll stick to the Stitch desktop-first layout for now */}
            </div>

            {/* Product Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={JSON.parse(JSON.stringify(product))} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm px-8">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">No matching products found</h2>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest max-w-xs mx-auto">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Link href="/" className="inline-block mt-8">
                  <Button variant="outline" className="rounded-2xl px-8 border-gray-200 text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-gray-100">Clear All Filters</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
