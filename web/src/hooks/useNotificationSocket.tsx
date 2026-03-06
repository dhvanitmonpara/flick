import { useEffect, useState } from "react"
import useSocket from "@/socket/useSocket"
import useProfileStore from "@/store/profileStore"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import getNotificationAction from "@/utils/getNotificationAction"
import { Notification } from "@/types/Notification"

export function useNotificationSocket() {
  const [notificationCount, setNotificationCount] = useState(0)
  const socket = useSocket()
  const navigate = useRouter().push

  useEffect(() => {
    if (!socket) return;

    const profile = useProfileStore.getState().profile;
    if (!profile?.id) return;

    socket.emit("initial-setup", { userId: profile.id });

    const handleNotification = (notification: { actorUsername: string, type: Notification["type"], postId: string }) => {
      toast.success(`${notification.actorUsername} ${getNotificationAction(notification.type)}`, {
        duration: 5000,
        action: {
          label: "View",
          onClick: () => navigate(`/p/${notification.postId}`),
        },
      });
    };

    const handleNotificationCount = (notification: { count: number }) => {
      setNotificationCount(notification.count);
    };

    socket.on("notification", handleNotification);
    socket.on("notification-count", handleNotificationCount);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("notification-count", handleNotificationCount);
    }
  }, [socket, navigate])

  return notificationCount
}
