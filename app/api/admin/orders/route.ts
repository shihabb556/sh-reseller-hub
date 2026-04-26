import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function isAdmin() {
    const session = await getServerSession(authOptions);
    return session?.user?.role === 'ADMIN';
}

export async function GET(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    await dbConnect();

    const query: any = {};
    if (orderId) {
        if (orderId.length === 24) {
            query._id = orderId;
        } else {
            query.$expr = {
                $regexMatch: {
                    input: { $toString: "$_id" },
                    regex: orderId + "$",
                    options: "i"
                }
            };
        }
    }
    if (status && status !== 'ALL') {
        query.status = status;
    }
    if (userId) {
        query.user = userId;
    }

    const orders = await Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, action, value } = await req.json();
    await dbConnect();

    let update = {};
    if (action === 'updateStatus') {
        update = { status: value };
    } else if (action === 'toggleAdvance') {
        update = { 'paymentStatus.advancePaid': value };
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    return NextResponse.json(order);
}
