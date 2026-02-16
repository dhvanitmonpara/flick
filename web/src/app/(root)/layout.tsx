"use client"

import { Toaster } from "sonner"
import { useEffect } from "react"
import axios from "axios"
import { env } from "@/config/env"
import { useRouter } from "next/navigation"

function RootLayout({ children }: { children: React.ReactElement }) {

  const navigate = useRouter().push

  useEffect(() => {
    (async () => {
      if (!env.SERVER_URI || env.NODE_ENV === "development") return
      const res = await axios.get(`${env.SERVER_URI}/health-check`)
      if (res.status !== 200) {
        navigate("/server-booting")
      }
    })()
  }, [navigate])

  return (
    <main className="w-screen h-screen overflow-x-hidden bg-zinc-100 dark:bg-zinc-900">
      {children}
      <Toaster />
    </main>
  )
}

export default RootLayout