import { AxiosError } from "axios"
import { toast } from "sonner"

export function toastError(err: unknown, fallbackMessage: string) {
  if (err instanceof AxiosError) {
    toast.error(err.response?.data.message || fallbackMessage)
  } else if (err instanceof Error) {
    toast.error(err.message || fallbackMessage)
  } else {
    toast.error(fallbackMessage)
  }
  console.error("Error", err)
}
