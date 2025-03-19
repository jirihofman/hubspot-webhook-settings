"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WebhookSubscriptions({ subscriptions, appId, hapiKey }) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    eventType: "",
    propertyName: "",
    active: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedSubscriptions, setSelectedSubscriptions] = useState({})
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0)
  const [bulkDeleteTotal, setBulkDeleteTotal] = useState(0)
  const router = useRouter()

  const eventTypes = [
    "contact.propertyChange",
    "company.propertyChange",
    "deal.propertyChange",
    "contact.creation",
    "company.creation",
    "deal.creation",
    "contact.deletion",
    "company.deletion",
    "deal.deletion",
  ]

  // Reset selected subscriptions when subscriptions change
  useEffect(() => {
    setSelectedSubscriptions({})
  }, [subscriptions])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handleCheckboxChange(id) {
    setSelectedSubscriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  function handleSelectAll(e) {
    const { checked } = e.target
    const newSelected = {}

    if (checked) {
      // Select all
      subscriptions.forEach((subscription) => {
        newSelected[subscription.id] = true
      })
    }

    setSelectedSubscriptions(newSelected)
  }

  function startCreate() {
    setFormData({
      eventType: "contact.propertyChange",
      propertyName: "",
      active: true,
    })
    setIsCreating(true)
    setEditingId(null)
  }

  function startEdit(subscription) {
    setFormData({
      eventType: subscription.eventType,
      propertyName: subscription.propertyName || "",
      active: subscription.active,
    })
    setIsCreating(false)
    setEditingId(subscription.id)
  }

  function cancelForm() {
    setIsCreating(false)
    setEditingId(null)
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const payload = {
      appId,
      hapiKey,
      subscription: {
        eventType: formData.eventType,
        active: formData.active,
      },
    }

    // Only include propertyName for propertyChange events
    if (formData.eventType.includes("propertyChange") && formData.propertyName) {
      payload.subscription.propertyName = formData.propertyName
    }

    try {
      const url = `/api/webhooks/subscriptions${editingId ? `/${editingId}` : ""}`
      const method = isCreating ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to ${isCreating ? "create" : "update"} subscription`)
      }

      cancelForm()
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/webhooks/subscriptions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId, hapiKey }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete subscription")
      }

      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBulkDelete() {
    const selectedIds = Object.keys(selectedSubscriptions).filter((id) => selectedSubscriptions[id])

    if (selectedIds.length === 0) {
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} subscription(s)?`)) {
      return
    }

    setIsBulkDeleting(true)
    setError("")
    setBulkDeleteTotal(selectedIds.length)
    setBulkDeleteProgress(0)

    // Function to delete a single subscription
    const deleteSubscription = async (id) => {
      try {
        const response = await fetch(`/api/webhooks/subscriptions/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appId, hapiKey }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to delete subscription")
        }

        setBulkDeleteProgress((prev) => prev + 1)
        return { id, success: true }
      } catch (error) {
        return { id, success: false, error: error.message }
      }
    }

    // Process deletions in batches of 5
    const results = []
    const batchSize = 5

    for (let i = 0; i < selectedIds.length; i += batchSize) {
      const batch = selectedIds.slice(i, i + batchSize)
      const batchPromises = batch.map((id) => deleteSubscription(id))

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    // Check if any deletions failed
    const failures = results.filter((result) => !result.success)

    if (failures.length > 0) {
      setError(`Failed to delete ${failures.length} subscription(s). Please try again.`)
    }

    setIsBulkDeleting(false)
    setSelectedSubscriptions({})
    router.refresh()
  }

  const selectedCount = Object.values(selectedSubscriptions).filter(Boolean).length
  const hasSubscriptions = subscriptions && subscriptions.length > 0
  const isAnySelected = selectedCount > 0

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Event Subscriptions</h3>
        <div className="flex space-x-2">
          {!isCreating && !editingId && (
            <button onClick={startCreate} className="btn btn-primary">
              Add Subscription
            </button>
          )}
          {isAnySelected && !isCreating && !editingId && !isBulkDeleting && (
            <button onClick={handleBulkDelete} className="btn btn-danger">
              Delete Selected ({selectedCount})
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {isBulkDeleting && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Deleting subscriptions...</span>
            <span>
              {bulkDeleteProgress} of {bulkDeleteTotal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(bulkDeleteProgress / bulkDeleteTotal) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-md font-medium mb-4">{isCreating ? "Create New Subscription" : "Edit Subscription"}</h4>

          <div className="mb-4">
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {formData.eventType.includes("propertyChange") && (
            <div className="mb-4">
              <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                id="propertyName"
                name="propertyName"
                type="text"
                value={formData.propertyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={cancelForm} className="btn btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Saving..." : isCreating ? "Create" : "Update"}
            </button>
          </div>
        </form>
      )}

      {hasSubscriptions ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onChange={handleSelectAll}
                      checked={hasSubscriptions && selectedCount === subscriptions.length}
                      disabled={isBulkDeleting || isLoading || editingId || isCreating}
                    />
                  </label>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Property
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-3 py-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={!!selectedSubscriptions[subscription.id]}
                        onChange={() => handleCheckboxChange(subscription.id)}
                        disabled={isBulkDeleting || isLoading || editingId || isCreating}
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subscription.eventType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.propertyName || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscription.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {subscription.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(subscription)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={isBulkDeleting || isLoading || editingId || isCreating}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isBulkDeleting || isLoading || editingId || isCreating}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">No subscriptions found. Create one to get started.</div>
      )}
    </div>
  )
}

