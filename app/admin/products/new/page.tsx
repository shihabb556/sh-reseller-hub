import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
            <ProductForm />
        </div>
    );
}
