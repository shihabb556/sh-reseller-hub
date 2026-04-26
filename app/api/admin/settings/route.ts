import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Settings } from '@/models/schema';
import dbConnect from '@/lib/db';

export async function GET() {
    try {
        await dbConnect();
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ advanceOption: 'Unpaid' });
        }
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { advanceOption } = await req.json();
        await dbConnect();

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ advanceOption });
        } else {
            settings.advanceOption = advanceOption;
            await settings.save();
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
    }
}
