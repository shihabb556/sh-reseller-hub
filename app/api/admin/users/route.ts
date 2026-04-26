import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'ADMIN';
}

export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const users = await User.aggregate([
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'user',
                as: 'userOrders'
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                role: 1,
                isActive: 1,
                createdAt: 1,
                orderCount: { $size: '$userOrders' }
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    return NextResponse.json(users);
}

export async function PATCH(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action, value } = await req.json();
    await dbConnect();

    let update = {};
    if (action === 'toggleStatus') {
        update = { isActive: value };
    } else if (action === 'toggleRole') {
        update = { role: value };
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    return NextResponse.json(user);
}
