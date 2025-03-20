import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import CredentialsForm from "./components/credentials-form"

export default async function Home() {
  const cookieStore = await cookies()
  const appId = cookieStore.get("hubspot_app_id")?.value
  const hapiKey = cookieStore.get("hubspot_hapi_key")?.value

  // If credentials are already stored, redirect to webhooks page
  if (appId && hapiKey) {
    redirect("/webhooks")
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Enter HubSpot Credentials</h2>
        <p className="text-gray-600 mb-6">
          To manage your webhook settings, please provide your HubSpot App ID and API Key.
        </p>
        <CredentialsForm />
      </div>
    </div>
  )
}

