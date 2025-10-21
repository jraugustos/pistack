import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'PIStack — Estruture suas ideias com IA',
  description: 'Canvas modular alimentado por IA que organiza seu processo criativo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const content = (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )

  if (!publishableKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk features will be disabled.'
      )
    }
    return content
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  )
}
