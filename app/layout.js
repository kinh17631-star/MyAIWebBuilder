import './globals.css'

export const metadata = {
  title: 'A S Tech - AI Web Builder',
  description: 'Generate Next.js websites using Gemini AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
