import '@radix-ui/themes/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Theme } from '@radix-ui/themes'
import * as Toast from '@radix-ui/react-toast'

export const metadata: Metadata = {
  title: 'iFINANCE - Group 14',
  description: 'Track your finances',
}
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Theme
          accentColor='indigo'
          grayColor='slate'
          appearance='light'
          radius='medium'
        >
          <Toast.Provider swipeDirection='right'>{children}</Toast.Provider>
        </Theme>
      </body>
    </html>
  )
}
