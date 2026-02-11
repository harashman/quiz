import './globals.css'

export const metadata = {
  title: 'Quiz App',
  description: 'Studia con i tuoi quiz personalizzati',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}