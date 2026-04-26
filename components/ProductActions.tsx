'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/shared';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { pixelViewContent, pixelAddToCart } from '@/lib/pixel';

export default function ProductActions({ product }: { product: any }) {
    const { addToCart } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();

    // ViewContent: fired when the user lands on the product page
    useEffect(() => {
        const effectivePrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
        pixelViewContent({
            content_ids: [product._id],
            content_name: product.name,
            value: effectivePrice,
        });
    }, [product._id]);

    const handleAddToCart = () => {
        if (product.stock > 0) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
            const effectivePrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
            // AddToCart pixel event
            pixelAddToCart({
                content_ids: [product._id],
                content_name: product.name,
                value: effectivePrice * quantity,
            });
            toast.success(`${quantity} ${product.name} added to cart!`);
        }
    };

    const handleBuyNow = () => {
        if (product.stock > 0) {
            addToCart(product);
            const effectivePrice = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
            // AddToCart pixel event (also fires on Buy Now)
            pixelAddToCart({
                content_ids: [product._id],
                content_name: product.name,
                value: effectivePrice,
            });
            router.push('/checkout');
        }
    };

    return (
        <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Quantity</p>
                <div className="flex items-center w-fit bg-gray-50 rounded-2xl p-1 border border-gray-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-10 w-10 text-gray-600 hover:bg-white rounded-xl transition-all"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm font-black text-gray-900">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="h-10 w-10 text-gray-600 hover:bg-white rounded-xl transition-all"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
                <Button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    variant="outline"
                    className="h-16 rounded-2xl border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 font-black uppercase tracking-[0.2em] text-xs gap-3 transition-all active:scale-95"
                >
                    <Zap className="h-4 w-4" /> Buy It Now
                </Button>
            </div>
        </div>
    );
}
