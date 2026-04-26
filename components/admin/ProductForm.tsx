'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui/shared';
import ImageUpload from '@/components/ui/ImageUpload';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Modal from '@/components/ui/Modal';

interface ProductFormProps {
    initialData?: any;
}

interface Category {
    _id: string;
    name: string;
    parent?: { _id: string } | null;
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        discountPrice: initialData?.discountPrice || '',
        stock: initialData?.stock || '',
        category: initialData?.category || '',
        subCategory: initialData?.subCategory || '',
        images: initialData?.images || [], // Now array
        isActive: initialData?.isActive ?? true,
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [errorModal, setErrorModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories');
        }
    };

    // Derived state for dropdowns
    const topLevelCategories = categories.filter(c => !c.parent);

    // Find the currently selected category object to get its ID
    const selectedCategoryObj = categories.find(c => c.name === formData.category && !c.parent);

    // Filter subcategories based on selected parent ID
    const availableSubCategories = selectedCategoryObj
        ? categories.filter(c => c.parent && c.parent._id === selectedCategoryObj._id)
        : [];

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')  // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = slugify(name);
        setFormData({ ...formData, name, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData
                ? `/api/admin/products/${initialData._id}`
                : '/api/admin/products';

            const method = initialData ? 'PUT' : 'POST';

            const submissionData = {
                ...formData,
                price: Number(formData.price),
                discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
                stock: Number(formData.stock)
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) throw new Error('Failed to save product');

            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            console.error(error);
            setErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={errorModal}
                onClose={() => setErrorModal(false)}
                title="Save Failed"
                variant="error"
                message="There was an error saving the product. Please check your inputs and try again."
                actions={[{ label: 'OK', onClick: () => setErrorModal(false), variant: 'ghost' }]}
            />
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <Input
                            required
                            value={formData.name}
                            onChange={handleNameChange}
                            className="mt-1 text-gray-700"
                        />
                    </div>

                    <div className="opacity-50 pointer-events-none">
                        <label className="block text-sm font-medium text-gray-700">Slug (Auto-generated)</label>
                        <Input
                            disabled
                            value={formData.slug}
                            className="mt-1 bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                            className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select Category</option>
                            {topLevelCategories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sub Category</label>
                        <select
                            value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                            disabled={!formData.category || availableSubCategories.length === 0}
                        >
                            <option value="">Select Sub Category</option>
                            {availableSubCategories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (BDT)</label>
                        <Input
                            type="number"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Price (BDT) - Optional</label>
                        <Input
                            type="number"
                            value={formData.discountPrice}
                            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                            className="mt-1"
                            placeholder="Leave empty for no discount"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <Input
                            type="number"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="mt-1"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={(val) => setFormData({ ...formData, description: val })}
                        placeholder="Enter product description..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                    <ImageUpload
                        value={formData.images}
                        onChange={(urls) => setFormData({ ...formData, images: urls })}
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="isActive"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active (Visible to customers)
                    </label>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </form>
        </>
    );
}
