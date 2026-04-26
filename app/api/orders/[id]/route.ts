import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/schema';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id || id.length < 4) {
            return NextResponse.json({ message: 'Invalid Order ID' }, { status: 400 });
        }

        await dbConnect();

        let order;
        if (id.length === 24) {
            order = await Order.findById(id)
                .select('status createdAt items totalAmount paymentStatus tracking guestEmail guestName shippingAddress')
                .lean();
        } else {
            // Partial match for non-24 char IDs
            order = await Order.findOne({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: id + "$",
                        options: "i"
                    }
                }
            })
                .select('status createdAt items totalAmount paymentStatus tracking guestEmail guestName shippingAddress')
                .lean();
        }

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order tracking error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
