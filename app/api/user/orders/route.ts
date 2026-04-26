import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order, Product } from '@/models/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderSchema } from '@/lib/validations';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();

        // Validate input
        const result = orderSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { message: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { items, shippingAddress, trxId, deliveryArea, guestEmail, guestName } = result.data;

        if (!session && (!guestEmail || !guestName)) {
            return NextResponse.json({ message: 'Email and Name are required for guest checkout' }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No items in order' }, { status: 400 });
        }

        await dbConnect();

        // Verify stock and snapshot prices
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ message: `Insufficient stock for: ${item.name}` }, { status: 400 });
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price, // Use discount price if available
                name: product.name,
                image: product.images?.[0],
            });
        }

        // Calculate delivery charge
        const deliveryCharge = deliveryArea === 'Inside Dhaka' ? 80 : 170;

        // Recalculate total for security
        const calculatedTotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + deliveryCharge;

        // Create Order
        const order = await Order.create({
            user: session?.user?.id || undefined,
            guestEmail: !session ? guestEmail : undefined,
            guestName: !session ? guestName : undefined,
            items: orderItems,
            totalAmount: calculatedTotal,
            deliveryCharge,
            deliveryArea,
            shippingAddress,
            status: 'PENDING',
            paymentStatus: {
                advancePaid: false, // Admin confirms this manually
                trxId: trxId || undefined,
                method: trxId ? 'ADVANCE' : 'COD'
            }
        });

        return NextResponse.json({ message: 'Order placed successfully', orderId: order._id }, { status: 201 });
    } catch (error) {
        console.error('Order placement error:', error);
        return NextResponse.json({ message: 'Failed to place order' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}
