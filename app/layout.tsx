import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import FlashMessages from '@/components/FlashMessages';
import ClientScripts from '@/components/ClientScripts';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'EvolveX Cohort Dashboard',
  description: 'Building a more connected startup ecosystem for Bharat.',
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
