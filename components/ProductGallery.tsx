'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0] || '');

    if (!images.length) {
        return (
            <div className="w-full aspect-square bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-400 border border-gray-100">
                No Image
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="w-full aspect-square bg-white rounded-[2.5rem] overflow-hidden relative border border-gray-100 shadow-xl shadow-blue-100/20 group">
                <Image
                    src={mainImage}
                    alt={name}
                    fill
                    className="w-full h-full object-contain p-8 transform group-hover:scale-110 transition-transform duration-700"
                    priority
                />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`
                            relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all
                            ${mainImage === img ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200'}
                        `}
                    >
                        <Image
                            src={img}
                            alt={`${name} thumbnail ${idx + 1}`}
                            fill
                            className="object-cover p-2"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
