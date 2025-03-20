import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    const cookieStore = await cookies()

    // Clear the credentials cookies
    cookieStore.delete("hubspot_app_id")
    cookieStore.delete("hubspot_hapi_key")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing credentials:", error)
    return NextResponse.json({ message: "Failed to clear credentials" }, { status: 500 })
  }
}

// Update the POST function to better handle the HubSpot API response
export async function POST(request) {
  try {
    const { appId, hapiKey } = await request.json()

    if (!appId || !hapiKey) {
      return NextResponse.json({ message: "App ID and API Key are required" }, { status: 400 })
    }

    // Validate credentials by making a test request to HubSpot API
    try {
      const response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/settings?hapikey=${hapiKey}`)

      // If we get a 404, it means settings don't exist yet, which is not an error
      if (response.status === 404) {
        console.log("No webhook settings found for this app ID")
      } else {
        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
          // Try to parse error response as JSON, but handle case where it's not valid JSON
          let errorMessage = "Invalid credentials or API error"
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch (parseError) {
            console.error("Error parsing HubSpot API error response:", parseError)
          }

          return NextResponse.json({ message: `HubSpot API Error: ${errorMessage}` }, { status: 401 })
        }

        // Try to parse the successful response
        try {
          await response.json()
        } catch (parseError) {
          console.error("Error parsing HubSpot API success response:", parseError)
          return NextResponse.json({ message: "Received invalid response from HubSpot API" }, { status: 500 })
        }
      }
    } catch (fetchError) {
      console.error("Error fetching from HubSpot API:", fetchError)
      return NextResponse.json({ message: `Connection error: ${fetchError.message}` }, { status: 500 })
    }

    // Store credentials in cookies
    const cookieStore = await cookies()
    cookieStore.set("hubspot_app_id", appId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    cookieStore.set("hubspot_hapi_key", hapiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving credentials:", error)
    return NextResponse.json({ message: `Failed to save credentials: ${error.message}` }, { status: 500 })
  }
}

