import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SonnerToaster } from 'components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Property Manager',
  description: 'Manage your properties efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          {children}
          <SonnerToaster />
        </div>
      </body>
    </html>
  )
}