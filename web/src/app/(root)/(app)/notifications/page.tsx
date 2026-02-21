"use client"

import NotificationCard from "@/components/general/NotificationCard"
import { useErrorHandler } from "@/hooks/useErrorHandler"
import { INotification } from "@/types/Notification"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { notificationApi } from "@/services/api/notification"

function NotificationsPage() {

  const [notifications, setNotifications] = useState<INotification[]>([])
  const [loading, setLoading] = useState(true)

  const { handleError } = useErrorHandler()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await notificationApi.list()

        if (res.status !== 200) {
          toast.error("Failed to fetch notifications")
          return
        }

        setNotifications(res.data.notifications)
        setLoading(false)

        // Optional delay
        await new Promise((res) => setTimeout(res, 3000))

        const unseen: INotification[] = res.data.notifications.filter((n: INotification) => !n.seen)
        if (unseen.length) {
          await notificationApi.markSeen(
            unseen.map((n) => n._id).filter((id): id is string => Boolean(id)),
          )
          setNotifications((prev) =>
            prev.map((n) => (unseen.some((u) => u._id === n._id) ? { ...n, seen: true } : n))
          )
        }
      } catch (err) {
        handleError(err as AxiosError | Error, "Failed to load notifications", undefined, undefined, "Fetch failed")
      }
    }

    load()
  }, [])

  return (
    <div>
      {loading && <p>Loading notifications...</p>}
      {notifications.map((n) => (
        <NotificationCard
          key={n._id || n._redisId}
          _redisId={n._redisId}
          actorUsernames={n.actorUsernames}
          post={n.post}
          _id={n._id}
          content={n.content}
          receiverId={n.receiverId}
          seen={n.seen}
          type={n.type}
          _retries={n._retries}
        />
      ))}
    </div>
  )
}

export default NotificationsPage
