import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Topbar from '@/components/shared/Topbar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import Rightsidebar from '@/components/shared/Rightsidebar'
import Bottombar from '@/components/shared/Bottombar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Threads",
  description: "A next js 13 meta thread application"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={inter.className}>
        <Topbar/>
        <main className='flex flex-row'> 
          <LeftSidebar/>
          <section className='main-container'>
            <div className='w-full max-w-4xl'>
              {children}
            </div>
          </section>
          <Rightsidebar/>
        </main>
        <Bottombar/>
      </body>
    </html>
    </ClerkProvider>
  )
}
