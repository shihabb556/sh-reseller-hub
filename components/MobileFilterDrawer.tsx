'use client';

import { useState } from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

interface MobileFilterDrawerProps {
    categories: any[];
}

export default function MobileFilterDrawer({ categories }: MobileFilterDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Filter Button – visible only on mobile/tablet */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-gray-900/30 font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors duration-300 active:scale-95"
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer – slides in from bottom on mobile */}
            <div
                className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-400 ease-in-out max-h-[85vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                {/* Drawer Handle */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-50 sticky top-0 bg-white z-10 rounded-t-[2.5rem]">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-blue-600" />
                        <h2 className="text-base font-black text-gray-900 uppercase italic tracking-tighter">Filters</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors active:scale-95"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="p-4">
                    <FilterSidebar categories={categories} onFilterApplied={() => setIsOpen(false)} />
                </div>
            </div>
        </>
    );
}
