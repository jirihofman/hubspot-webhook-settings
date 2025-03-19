import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import WebhookSettings from "../components/webhook-settings"
import WebhookSubscriptions from "../components/webhook-subscriptions"
import LogoutButton from "../components/logout-button"

async function getWebhookSettings(appId, hapiKey) {
  try {
    const response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/settings?hapikey=${hapiKey}`, {
      cache: "no-store",
    })

    // If we get a 404, it means settings don't exist yet, which is not an error
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      let errorMessage = "Failed to fetch webhook settings"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }
      throw new Error(errorMessage)
    }

    try {
      return await response.json()
    } catch (parseError) {
      console.error("Error parsing success response:", parseError)
      throw new Error("Received invalid response from HubSpot API")
    }
  } catch (error) {
    console.error("Error fetching webhook settings:", error)
    throw error
  }
}

async function getWebhookSubscriptions(appId, hapiKey) {
  try {
    const response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/subscriptions?hapikey=${hapiKey}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      let errorMessage = "Failed to fetch webhook subscriptions"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }
      throw new Error(errorMessage)
    }

    try {
      const data = await response.json()
      // Extract the results array from the response
      return data.results || []
    } catch (parseError) {
      console.error("Error parsing success response:", parseError)
      throw new Error("Received invalid response from HubSpot API")
    }
  } catch (error) {
    console.error("Error fetching webhook subscriptions:", error)
    throw error
  }
}

export default async function WebhooksPage() {
  const cookieStore = cookies()
  const appId = cookieStore.get("hubspot_app_id")?.value
  const hapiKey = cookieStore.get("hubspot_hapi_key")?.value

  // If credentials are not stored, redirect to home page
  if (!appId || !hapiKey) {
    redirect("/")
  }

  let settings = null
  let subscriptions = null
  let error = null

  try {
    // Fetch webhook settings and subscriptions in parallel
    // If settings don't exist, getWebhookSettings will return null (not throw)
    ;[settings, subscriptions] = await Promise.all([
      getWebhookSettings(appId, hapiKey).catch((err) => {
        console.error("Error fetching settings:", err)
        return null // Return null instead of throwing
      }),
      getWebhookSubscriptions(appId, hapiKey),
    ])
  } catch (err) {
    error = err.message
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">HubSpot Webhook Management</h2>
        <LogoutButton />
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      ) : (
        <>
          <WebhookSettings settings={settings} appId={appId} hapiKey={hapiKey} />
          <div className="mt-8">
            <WebhookSubscriptions subscriptions={subscriptions} appId={appId} hapiKey={hapiKey} />
          </div>
        </>
      )}
    </div>
  )
}

