import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { appId, hapiKey, subscription } = await request.json()

    if (!appId || !hapiKey || !subscription) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 })
    }

    let response
    try {
      response = await fetch(`https://api.hubapi.com/webhooks/v3/${appId}/subscriptions?hapikey=${hapiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })
    } catch (fetchError) {
      console.error("Network error when creating subscription:", fetchError)
      return NextResponse.json({ message: `Network error: ${fetchError.message}` }, { status: 500 })
    }

    // Check if the response is OK
    if (!response.ok) {
      // For non-OK responses, don't try to parse JSON if status is 204 (No Content)
      if (response.status === 204) {
        return NextResponse.json({ message: "HubSpot API returned no content" }, { status: response.status })
      }

      // Try to get the response text first
      let responseText
      try {
        responseText = await response.text()
      } catch (textError) {
        console.error("Error getting response text:", textError)
        responseText = ""
      }

      // Try to parse the response text as JSON
      let errorMessage = "Failed to create subscription"
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          console.error("Error parsing error response text as JSON:", parseError)
          // Use the raw text if it's not JSON
          if (responseText.trim()) {
            errorMessage = `API returned: ${responseText}`
          }
        }
      }

      return NextResponse.json({ message: `HubSpot API Error: ${errorMessage}` }, { status: response.status })
    }

    // For successful responses, handle 204 No Content
    if (response.status === 204) {
      return NextResponse.json({ success: true })
    }

    // Try to get the response text first
    let responseText
    try {
      responseText = await response.text()
    } catch (textError) {
      console.error("Error getting success response text:", textError)
      // If we can't get the text but the status was OK, assume success
      return NextResponse.json({ success: true })
    }

    // If the response is empty but status is OK, return success
    if (!responseText.trim()) {
      return NextResponse.json({ success: true })
    }

    // Try to parse the response text as JSON
    try {
      const newSubscription = JSON.parse(responseText)
      return NextResponse.json(newSubscription)
    } catch (parseError) {
      console.error("Error parsing success response text as JSON:", parseError)
      // If we can't parse as JSON but the status was OK, assume success
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Error creating webhook subscription:", error)
    return NextResponse.json({ message: `Failed to create webhook subscription: ${error.message}` }, { status: 500 })
  }
}

