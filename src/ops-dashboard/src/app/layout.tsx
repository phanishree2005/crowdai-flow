import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrowdFlow AI Operations',
  description: 'Enterprise Control Plane',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <nav className="w-full bg-crowd_panel border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="font-bold text-xl text-crowd_green tracking-tight">CrowdFlow Ops</div>
          <div className="text-sm text-gray-400">System Status: <span className="text-green-500">Operational</span></div>
        </nav>
        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
