"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WebhookSettings({ settings, appId, hapiKey }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    targetUrl: settings?.targetUrl || "",
    maxConcurrentRequests: settings?.throttling?.maxConcurrentRequests || 10,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // If settings are null or empty, automatically show the edit form
  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) {
      setIsEditing(true)
    }
  }, [settings])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxConcurrentRequests" ? Number.parseInt(value, 10) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/webhooks/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId,
          hapiKey,
          settings: {
            targetUrl: formData.targetUrl,
            throttling: {
              maxConcurrentRequests: formData.maxConcurrentRequests,
            },
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update webhook settings")
      }

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete the webhook settings? This will remove all settings and cannot be undone.",
      )
    ) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/webhooks/settings`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId,
          hapiKey,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete webhook settings")
      }

      // After successful deletion, show the form to create new settings
      setIsEditing(true)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const hasSettings = settings && Object.keys(settings).length > 0

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Webhook Settings</h3>
        {!isEditing && (
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
              {hasSettings ? "Edit Settings" : "Create Settings"}
            </button>
            {hasSettings && (
              <button onClick={handleDelete} className="btn btn-danger" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Settings"}
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Target URL
            </label>
            <input
              id="targetUrl"
              name="targetUrl"
              type="url"
              value={formData.targetUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="maxConcurrentRequests" className="block text-sm font-medium text-gray-700 mb-1">
              Max Concurrent Requests
            </label>
            <input
              id="maxConcurrentRequests"
              name="maxConcurrentRequests"
              type="number"
              min="1"
              value={formData.maxConcurrentRequests}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            {hasSettings && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : hasSettings ? "Save Settings" : "Create Settings"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {hasSettings ? (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Target URL</h4>
                <p className="mt-1">{settings?.targetUrl || "Not set"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Max Concurrent Requests</h4>
                <p className="mt-1">{settings?.throttling?.maxConcurrentRequests || "Not set"}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No webhook settings configured. Use the "Create Settings" button above to set up webhooks.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

