import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Arte Cutting-Edge - Paint App Profissional',
  description: 'Aplicativo de pintura avançado com IA, ferramentas profissionais e interface cutting-edge para criar arte digital incrível.',
  keywords: ['paint app', 'arte digital', 'pintura', 'desenho', 'canvas', 'cutting-edge', 'IA'],
  authors: [{ name: 'Arte Cutting-Edge Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Arte Cutting-Edge - Paint App Profissional',
    description: 'Crie arte digital incrível com nossa aplicação de pintura cutting-edge',
    type: 'website',
    locale: 'pt_BR',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#6366F1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
