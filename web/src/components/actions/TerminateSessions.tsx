import { useErrorHandler } from "@/hooks/useErrorHandler"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/services/api/auth"

function TerminateSessions() {
  const navigate = useRouter().push

  const { handleError } = useErrorHandler()

  const handleTerminate = async () => {
    let toastId
    try {
      toastId = toast.loading("Terminating sessions...")

      const isSuccess = await authApi.session.logoutAll()

      if (!isSuccess) {
        throw new Error("Failed to terminate sessions")
      }

      navigate("/")
      toast.success("Sessions terminated successfully, You've been logged out from all devices")
    } catch (error) {
      handleError(error as AxiosError | Error, "Something went wrong while terminating sessions", undefined, () => handleTerminate(), "Failed to terminate sessions")
    } finally {
      toast.dismiss(toastId)
    }
  }

  return (
    <div
      className="bg-red-500 text-zinc-100 fixed z-50 bottom-0 space-x-4 left-0 right-0 text-center py-2 font-semibold">
      <span>Do you want to terminate sessions in all devices?</span>
      <button onClick={handleTerminate} className="font-semibold underline">Yes</button>
      <button onClick={() => navigate("/")} className="font-semibold underline">No</button>
    </div>
  )
}

export default TerminateSessions
