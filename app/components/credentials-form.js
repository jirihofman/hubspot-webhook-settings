"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CredentialsForm() {
  const [appId, setAppId] = useState("")
  const [hapiKey, setHapiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId, hapiKey }),
      })

      // First check if the response is ok
      if (!response.ok) {
        // Try to parse the error response
        let errorMessage = "Failed to save credentials"
        try {
          const data = await response.json()
          errorMessage = data.message || errorMessage
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
        throw new Error(errorMessage)
      }

      // Try to parse the success response
      try {
        await response.json()
        router.push("/webhooks")
        router.refresh()
      } catch (parseError) {
        console.error("Error parsing success response:", parseError)
        throw new Error("Received invalid response from server")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-1">
          App ID
        </label>
        <input
          id="appId"
          type="text"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="hapiKey" className="block text-sm font-medium text-gray-700 mb-1">
          API Key (hapiKey)
        </label>
        <input
          id="hapiKey"
          type="password"
          value={hapiKey}
          onChange={(e) => setHapiKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <button type="submit" disabled={isLoading} className="w-full btn btn-primary">
        {isLoading ? "Connecting..." : "Connect to HubSpot"}
      </button>
    </form>
  )
}
