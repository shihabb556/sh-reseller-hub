'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui/shared';
import { Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface Category {
    _id: string;
    name: string;
    slug: string;
    parent?: { _id: string; name: string } | null;
    isActive: boolean;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', parent: '' });
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; categoryId: string | null }>({ open: false, categoryId: null });

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
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    parent: formData.parent || null
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrorModal({ open: true, message: data.message || 'Failed to create category' });
                return;
            }

            setFormData({ name: '', parent: '' });
            fetchCategories();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setConfirmModal({ open: true, categoryId: id });
    };

    const handleDelete = async () => {
        const id = confirmModal.categoryId;
        if (!id) return;
        setConfirmModal({ open: false, categoryId: null });
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const data = await res.json();
                setErrorModal({ open: true, message: data.message || 'Failed to delete' });
                return;
            }
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const potentialParents = categories;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>

            {/* Error Modal */}
            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ open: false, message: '' })}
                title="Error"
                variant="error"
                message={errorModal.message}
                actions={[{ label: 'OK', onClick: () => setErrorModal({ open: false, message: '' }), variant: 'ghost' }]}
            />

            {/* Confirm Delete Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, categoryId: null })}
                title="Delete Category"
                variant="confirm"
                message="Are you sure you want to delete this category? This action cannot be undone."
                actions={[
                    { label: 'Cancel', onClick: () => setConfirmModal({ open: false, categoryId: null }), variant: 'ghost' },
                    { label: 'Delete', onClick: handleDelete, variant: 'danger' },
                ]}
            />

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg text-gray-700 font-medium mb-4">Add New Category</h3>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Category Name"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Optional)</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input text-gray-700 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.parent}
                            onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                        >
                            <option value="">None (Top Level)</option>
                            {potentialParents.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Adding...' : 'Add Category'}
                    </Button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center">No categories found</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.slug}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cat.parent ? cat.parent.name : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => confirmDelete(cat._id)}
                                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
