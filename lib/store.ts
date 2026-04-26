import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item._id === product._id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [...items, {
                            _id: product._id,
                            name: product.name,
                            price: (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price,
                            image: product.images?.[0] || '',
                            slug: product.slug,
                            quantity: 1
                        }],
                    });
                }
            },
            removeFromCart: (productId) => {
                set({ items: get().items.filter((item) => item._id !== productId) });
            },
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item._id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'shopping-cart',
        }
    )
);
