import "./globals.css"

export const metadata = {
  title: "HubSpot Webhook Settings Manager",
  description: "Manage your HubSpot webhook settings",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">HubSpot Webhook Settings</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  )
}



import './globals.css'