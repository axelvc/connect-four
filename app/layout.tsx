import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Connect Four',
  description: 'Connect Four',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-base-200 text-base-900">{children}</body>
    </html>
  )
}
