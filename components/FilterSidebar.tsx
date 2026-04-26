'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button, Input } from './ui/shared';
import { ChevronRight, Filter, ShoppingBag } from 'lucide-react';

interface FilterSidebarProps {
    categories: any[];
    onFilterApplied?: () => void;
}

export default function FilterSidebar({ categories, onFilterApplied }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [priceRange, setPriceRange] = useState({
        min: Number(searchParams.get('minPrice')) || 0,
        max: Number(searchParams.get('maxPrice')) || 150000
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get('category')?.split(',') || []
    );

    const updateFilters = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/?${params.toString()}`);
    };

    const handleCategoryToggle = (slug: string) => {
        const newCategories = selectedCategories.includes(slug)
            ? selectedCategories.filter(c => c !== slug)
            : [...selectedCategories, slug];

        setSelectedCategories(newCategories);
        updateFilters({ category: newCategories.length > 0 ? newCategories.join(',') : null });
        onFilterApplied?.();
    };

    const handlePriceChange = () => {
        updateFilters({
            minPrice: priceRange.min.toString(),
            maxPrice: priceRange.max.toString()
        });
        onFilterApplied?.();
    };

    // Build recursive tree
    const buildTree = (cats: any[], parentId: string | null = null): any[] => {
        return cats
            .filter(c => {
                const pid = typeof c.parent === 'object' ? c.parent?._id : c.parent;
                return pid === parentId || (parentId === null && !pid);
            })
            .map(c => ({
                ...c,
                children: buildTree(cats, c._id)
            }));
    };

    const categoryTree = buildTree(categories);

    // Helper to render tree
    const renderCategory = (cat: any, depth: number = 0) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isSelected = selectedCategories.includes(cat.slug);

        return (
            <div key={cat._id} className="space-y-1">
                <Button
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleCategoryToggle(cat.slug)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm transition-all ${isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                        : 'border-transparent hover:border-gray-200 text-gray-500 hover:bg-gray-50 font-medium hover:text-blue-600'
                        }`}
                    style={{ paddingLeft: `${1 + depth * 1}rem` }}
                >
                    <span className="truncate">{cat.name}</span>
                    {hasChildren ? (
                        <ChevronRight className={`h-3 w-3 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    ) : (
                        isSelected && <ChevronRight className="h-3 w-3" />
                    )}
                </Button>
                {hasChildren && (isSelected || selectedCategories.some(slug => cat.children.some((child: any) => child.slug === slug))) && (
                    <div className="ml-2 border-l border-gray-50 pl-2">
                        {cat.children.map((child: any) => renderCategory(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-full lg:w-72 space-y-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-28 h-fit">
            <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-black text-gray-900 uppercase italic tracking-tighter">Filters</h2>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Categories</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <Button
                        variant={selectedCategories.length === 0 ? 'default' : 'outline'}
                        onClick={() => {
                            setSelectedCategories([]);
                            updateFilters({ category: null });
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategories.length === 0
                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100'
                            : 'border-transparent hover:border-gray-200 text-gray-500 hover:bg-gray-50 font-medium'
                            }`}
                    >
                        <span>All Products</span>
                        <ChevronRight className={`h-4 w-4 ${selectedCategories.length === 0 ? 'text-white' : 'text-gray-300'}`} />
                    </Button>
                    {categoryTree.map(cat => renderCategory(cat))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2">Price Range (BDT)</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Min</label>
                            <Input
                                type="number"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                className="bg-gray-50 border-transparent text-xs font-bold rounded-lg"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Max</label>
                            <Input
                                type="number"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                className="bg-gray-50 border-transparent text-xs font-bold rounded-lg"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handlePriceChange}
                        className="w-full bg-gray-900 hover:bg-black text-white rounded-xl py-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-100"
                    >
                        Apply Price
                    </Button>
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2">Availability</h3>
                <div className="space-y-2">
                    {['In Stock', 'Pre-order'].map((status) => (
                        <label key={status} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-xl cursor-pointer group transition-colors">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={searchParams.get('availability')?.includes(status) || false}
                                onChange={(e) => {
                                    const current = searchParams.get('availability')?.split(',') || [];
                                    const next = e.target.checked
                                        ? [...current, status]
                                        : current.filter(s => s !== status);
                                    updateFilters({ availability: next.length > 0 ? next.join(',') : null });
                                    onFilterApplied?.();
                                }}
                            />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{status}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Promo Card */}
            <div className="mt-8 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden group shadow-2xl shadow-blue-200">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-lg font-black uppercase italic tracking-tighter mb-2 relative z-10">Flash Sale</h4>
                <p className="text-xs font-bold text-blue-100 mb-4 relative z-10 leading-relaxed uppercase tracking-wider">Get 10% off on all accessories this week!</p>
                <div className="h-24 w-24 bg-blue-500/20 absolute -bottom-6 -right-6 rounded-full blur-xl"></div>
                <ShoppingBag className="absolute bottom-4 right-4 h-12 w-12 text-white/10" />
            </div>
        </aside>
    );
}
