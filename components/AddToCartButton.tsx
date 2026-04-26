'use client';

import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/shared';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: any }) {
    const addToCart = useCartStore((state) => state.addToCart);
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <Button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="border border-gray-300  text-black w-full md:max-w-xs flex justify-center py-3 px-8 text-base font-medium"
        >
            {product.stock <= 0 ? 'Out of Stock' : (added ? 'Added to Cart!' : 'Add to Cart')}
        </Button>
    );
}
