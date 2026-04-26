import Navbar from '@/components/Navbar';
import dbConnect from '@/lib/db';
import { Product } from '@/models/schema';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';
import { CheckCircle2, ShieldCheck, Truck, RefreshCcw, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found | Gadget Bazar BD',
        };
    }

    return {
        title: product.name,
        description: product.description.slice(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.slice(0, 160),
            images: product.images?.[0] ? [{ url: product.images[0] }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description.slice(0, 160),
            images: product.images?.[0] ? [product.images[0]] : [],
        }
    };
}

async function getProduct(slug: string) {
    await dbConnect();
    const product = await Product.findOne({ slug, isActive: true });
    return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelatedProducts(category: string, currentId: string) {
    await dbConnect();
    const related = await Product.find({
        category,
        isActive: true,
        _id: { $ne: currentId }
    }).limit(4);
    return JSON.parse(JSON.stringify(related));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category, product._id);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: `GB-${product._id.slice(-8).toUpperCase()}`,
        brand: {
            '@type': 'Brand',
            name: 'Gadget Bazar BD',
        },
        offers: {
            '@type': 'Offer',
            url: `https://gadgetbazarbd.com/products/${product.slug}`,
            priceCurrency: 'BDT',
            price: (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
        },
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link href={`/?category=${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
                </nav>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 lg:items-start bg-white rounded-[3rem] p-6 md:p-12 shadow-xl shadow-blue-100/20 border border-gray-100">
                    {/* Image gallery */}
                    <ProductGallery images={product.images || []} name={product.name} />

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <div className="space-y-6">
                            {/* Badges & Status */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                    <CheckCircle2 className="h-3 w-3" /> In Stock
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                    SKU: GB-{product._id.slice(-8).toUpperCase()}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">
                                {product.name}
                            </h1>

                            {/* Trust Seals */}
                            <div className="flex items-center gap-4 py-2 border-y border-gray-50">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">4.8 (124 reviews)</span>
                                </div>
                                <div className="h-4 w-[1px] bg-gray-200"></div>
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Official Warranty</span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    {(() => {
                                        const dp = Number(product.discountPrice) || 0;
                                        const hasDiscount = dp > 0 && dp < product.price;
                                        return hasDiscount ? (
                                            <>
                                                <p className="text-4xl font-black text-red-600 tracking-tighter">৳{dp.toLocaleString()}</p>
                                                <p className="text-lg font-bold text-gray-400 line-through">৳{product.price.toLocaleString()}</p>
                                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-red-100">
                                                    SAVE {Math.round(((product.price - dp) / product.price) * 100)}%
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-4xl font-black text-gray-900 tracking-tighter">৳{product.price.toLocaleString()}</p>
                                                <p className="text-lg font-bold text-gray-400 line-through">৳{(product.price * 1.05).toLocaleString()}</p>
                                            </>
                                        );
                                    })()}
                                </div>
                                <p className="text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                                    Or ৳{(Math.round((Number(product.discountPrice) > 0 && Number(product.discountPrice) < product.price ? Number(product.discountPrice) : product.price) / 12)).toLocaleString()}/month with 0% EMI
                                </p>
                            </div>

                            <div className="h-[1px] bg-gray-100 w-full" />

                            <ProductActions product={product} />

                            {/* Delivery Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                                <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors group">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-0.5">Delivery Charge</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            Inside Dhaka: ৳80 (ঢাকাঃ ৮০ টাকা) <br />
                                            Outside Dhaka: ৳170 (ঢাকার বাইরেঃ ১৭০ টাকা)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors group">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <RefreshCcw className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-0.5">7 Days Return</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Easy Return Policy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description & Specs Section */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-blue-600 rounded-full" />
                                Description
                            </h2>
                            <div className="text-gray-700 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-blue-100/10 transition-all hover:shadow-blue-100/20">
                                <div
                                    className="text-base text-gray-600 leading-relaxed font-medium prose prose-sm max-w-none ql-editor 
                                        prose-headings:text-gray-900 prose-headings:font-black prose-headings:uppercase 
                                        prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-gray-900 rounded-full" />
                            Technical Specs
                        </h2>
                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-blue-100/10 hover:shadow-blue-100/20 transition-all">
                            {[
                                { label: 'Category', value: product.category },
                                { label: 'Sub Category', value: product.subCategory || 'N/A' },
                                { label: 'Stock Status', value: product.stock > 0 ? 'In Stock' : 'Out of Stock' },
                                { label: 'SKU', value: `GB-${product._id.slice(-8).toUpperCase()}` },
                                { label: 'Warranty', value: '1 Year Official' }
                            ].map((spec, i) => (
                                <div key={i} className={`flex justify-between p-5 text-sm ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                                    <span className="font-black text-gray-400 uppercase tracking-widest text-[10px]">{spec.label}</span>
                                    <span className="font-bold text-gray-900 text-xs">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter flex items-center gap-3">
                                <div className="h-10 w-2 bg-blue-600 rounded-full" />
                                Related Products
                            </h2>
                            <Link href={`/?category=${product.category}`} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1">
                                View All <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ">
                            {relatedProducts.map((p: any) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
