import './globals.css'

export const metadata = {
  title: 'Quiz App',
  description: 'Studia con i tuoi quiz personalizzati',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}