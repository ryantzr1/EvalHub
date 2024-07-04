import { Rubik } from 'next/font/google'
import { Arimo } from 'next/font/google'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"


const rubik = Rubik({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik',
})
const arimo = Arimo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-arimo',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={rubik.variable + ' ' + arimo.variable}>
        {children}
        <Analytics />

      </body>
    </html>
  )
}