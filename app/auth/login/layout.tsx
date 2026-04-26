import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login to your Gadget Bazar BD account to manage orders, track shipments, and update your profile.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
