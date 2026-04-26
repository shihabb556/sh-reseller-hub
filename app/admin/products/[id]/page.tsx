import ProductForm from '@/components/admin/ProductForm';
import dbConnect from '@/lib/db';
import { Product } from '@/models/schema';
import { notFound } from 'next/navigation';

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findById(id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
            <ProductForm initialData={product} />
        </div>
    );
}
