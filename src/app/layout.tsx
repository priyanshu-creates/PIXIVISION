import type { Metadata } from 'next';
import { Nunito_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

const nexa = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nexa',
  display: 'swap',
  weight: ['400', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'PIXIVISION - AI Image Analysis',
  description: 'Upload images for AI-powered classification and description.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nexa.variable}>
      <body className={'antialiased font-sans'}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="py-6 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} PIXIVISION. All rights reserved.
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
