import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register',
    description: 'Create a Gadget Bazar BD account to enjoy a personalized shopping experience, track orders, and more.',
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
