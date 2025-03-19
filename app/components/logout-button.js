"use client"

import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch("/api/credentials", {
        method: "DELETE",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <button onClick={handleLogout} className="btn btn-secondary">
      Logout
    </button>
  )
}

