"use client"

import { Toaster } from "sonner"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { appApi } from "@/services/api/app"
import ThemedToaster from "@/components/general/ThemedToaster"

function RootLayout({ children }: { children: React.ReactElement }) {
  const navigate = useRouter().push

  useEffect(() => {
    (async () => {
      if (process.env.NODE_ENV === "development") return
      const res = await appApi.health()
      if (res.status !== 200) {
        navigate("/server-booting")
      }
    })()
  }, [navigate])

  return (
    <main className="w-screen h-screen overflow-x-hidden bg-zinc-100 dark:bg-zinc-900">
      {children}
      <ThemedToaster />
    </main>
  )
}

export default RootLayout
