import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    image: String,
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    lastName: String,
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['ADMIN', 'CUSTOMER'],
        default: 'CUSTOMER',
    },
    primaryPhone: String,
    secondaryPhone: String,
    village: String,
    thana: String,
    district: String,
    isActive: {
        type: Boolean,
        default: true,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    subCategory: String,
    images: [String],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    guestEmail: {
        type: String,
        required: false,
    },
    guestName: {
        type: String,
        required: false,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: { // Snapshot price at time of order
            type: Number,
            required: true,
        },
        name: String, // Snapshot name
        image: String, // Snapshot image
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        required: true,
        default: 0,
    },
    deliveryArea: {
        type: String,
        enum: ['Inside Dhaka', 'Outside Dhaka'],
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
    },
    shippingAddress: {
        street: String,
        city: String,
        phone: String,
        village: String,
        thana: String,
        district: String,
        secondaryPhone: String,
    },
    paymentStatus: {
        advancePaid: {
            type: Boolean,
            default: false,
        },
        trxId: String,
        method: {
            type: String,
            default: 'COD', // Cash On Delivery
        }
    }
}, { timestamps: true });

// Index for getting user orders and admin filtering
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const SettingsSchema = new mongoose.Schema({
    advanceOption: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid',
    }
}, { timestamps: true });

export const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

const LoginAttemptSchema = new mongoose.Schema({
    ip: { type: String, required: true, index: true },
    userAgent: String,
    attempts: { type: Number, default: 0 },
    lockUntil: Date,
}, { timestamps: true });

export const LoginAttempt = mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema);
