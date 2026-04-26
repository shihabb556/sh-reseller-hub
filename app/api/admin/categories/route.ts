import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Category } from '@/models/schema';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        await dbConnect();
        // Fetch all categories
        const categories = await Category.find({}).sort({ name: 1 }).populate('parent');
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, parent, image } = body;

        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        await dbConnect();

        // Simple slug generation
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // Check for duplicate slug
        const existing = await Category.findOne({ slug });
        if (existing) {
            return NextResponse.json({ message: 'Category with this name already exists' }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug,
            parent: parent || null,
            image
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
