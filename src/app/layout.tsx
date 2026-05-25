import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mam-dca.vercel.app'),
  title: 'Mầm · DCA Advisory',
  description: 'Công cụ tư vấn & mô phỏng DCA miễn phí cho nhà đầu tư trẻ Việt Nam. Lập kế hoạch đầu tư định kỳ vào ETF, quỹ mở, cổ phiếu và vàng.',
  manifest: '/manifest.json',
  keywords: ['DCA', 'đầu tư định kỳ', 'ETF', 'quỹ mở', 'tài chính cá nhân', 'Việt Nam'],
  authors: [{ name: 'Mầm Team' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mầm',
  },
  icons: {
    icon: '/mam-logo-192.png',
    apple: '/mam-logo-192.png',
    shortcut: '/mam-logo-192.png',
  },
  openGraph: {
    title: 'Mầm · DCA Advisory',
    description: 'Công cụ tư vấn & mô phỏng DCA miễn phí cho nhà đầu tư trẻ Việt Nam',
    url: 'https://mam-dca.vercel.app',
    siteName: 'Mầm',
    images: [{ url: '/mam-logo-512.png', width: 512, height: 512, alt: 'Mầm DCA' }],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mầm · DCA Advisory',
    description: 'Công cụ tư vấn & mô phỏng DCA miễn phí cho nhà đầu tư trẻ Việt Nam',
    images: ['/mam-logo-512.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#22C55E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${nunito.variable} h-full`}>
      <body className="h-full antialiased font-sans">
        {/* Phone bezel wrapper — fills viewport on mobile, centered frame on desktop */}
        <div id="mam-root" className="flex flex-col h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
