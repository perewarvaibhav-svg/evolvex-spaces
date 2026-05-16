import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import FlashMessages from '@/components/FlashMessages';
import ClientScripts from '@/components/ClientScripts';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: {
    default: 'EvolveX Cohort Dashboard | Learn. Build. Launch.',
    template: '%s | EvolveX'
  },
  description: 'A 90-day builder journey where students explore ideas, learn by doing, talk to real users, and turn small sparks into working projects.',
  keywords: ['startup', 'founder sprint', 'builder journey', 'EvolveX', 'entrepreneurship', 'incubator', 'startup ecosystem', 'Bharat'],
  authors: [{ name: 'EvolveX Team' }],
  creator: 'EvolveX',
  publisher: 'EvolveX',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://evolvex.in',
    title: 'EvolveX Cohort Dashboard',
    description: 'A 90-day builder journey for founders. Learn. Build. Launch.',
    siteName: 'EvolveX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EvolveX Cohort Dashboard',
    description: 'A 90-day builder journey for founders. Learn. Build. Launch.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const messages = session.flash || [];
  
  if (messages.length > 0) {
    // Note: flash is cleared by /api/flash/clear after display (client-side)
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="markcon-theme">
        <div className="global-crazy-bg">
          <div className="c-blob c-blob-1"></div>
          <div className="c-blob c-blob-2"></div>
          <div className="c-blob c-blob-3"></div>
          <div className="c-blob c-blob-4"></div>
          <div className="c-glass"></div>
        </div>

        <Navbar session={{ user_id: session.user_id, role: session.role }} />
        
        <main>
          <FlashMessages messages={messages} />
          {children}
        </main>
        
        <footer className="footer">
          <b>EvolveX</b> · Building a more connected startup ecosystem for Bharat.
        </footer>
        
        {/* Using a client component for the JS animations since they use document queries */}
        <ClientScripts />
      </body>
    </html>
  );
}
