import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CRO Evidence-Based Audit Engine',
  description: 'Generate structured CRO audits based on UX, customer psychology, friction analysis, trust signals, and conversion principles.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
