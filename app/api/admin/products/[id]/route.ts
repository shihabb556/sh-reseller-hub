import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'ADMIN';
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    await dbConnect();
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(product);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await dbConnect();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
}
