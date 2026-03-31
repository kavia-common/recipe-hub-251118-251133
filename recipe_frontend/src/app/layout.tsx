import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Recipe Hub',
    description: 'Retro-inspired recipe discovery, meal planning, favorites, and shopping lists.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body>{children}</body>
        </html>
    );
}
