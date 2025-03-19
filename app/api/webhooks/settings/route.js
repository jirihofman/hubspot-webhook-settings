import { NextResponse } from "next/server"

export async function PUT(request) {
  try {
    const { appId, hapiKey, settings } = await request.json()

    if (!appId || !hapiKey || !settings) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    const response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/settings?hapikey=${hapiKey}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: `HubSpot API Error: ${errorData.message || "Failed to update settings"}` },
        { status: response.status },
      )
    }

    const updatedSettings = await response.json()
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating webhook settings:", error)
    return NextResponse.json({ message: "Failed to update webhook settings" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { appId, hapiKey } = await request.json()

    if (!appId || !hapiKey) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    const response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/settings?hapikey=${hapiKey}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      let errorMessage = "Failed to delete webhook settings"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (parseError) {
        console.error("Error parsing error response:", parseError)
      }
      return NextResponse.json({ message: `HubSpot API Error: ${errorMessage}` }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting webhook settings:", error)
    return NextResponse.json({ message: "Failed to delete webhook settings" }, { status: 500 })
  }
}

