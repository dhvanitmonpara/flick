import { FeedbackTable } from "@/components/general/FeedbackTable"
import { env } from "@/config/env"
import { IFeedback } from "@/types/Feedback"
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function FeedbackPage() {

  const [feedback, setFeedback] = useState<IFeedback[]>([])

  useEffect(() => {
    (async () => {
      const res = await axios.get(
        `${env.apiUrl}/manage/feedback/all`,
        { withCredentials: true }
      )
      if (res.status !== 200) {
        toast.error("Failed to fetch feedbacks")
        return
      }
      setFeedback(res.data)
    })()
  }, [])

  return (
    <div className="p-6 col-span-10">
      <div className={`bg-zinc-800/50 px-3 w-full ${feedback.length === 0 && "min-h-52"} rounded-md`}>
        {feedback.length > 0 ? (
          <FeedbackTable data={feedback} setData={setFeedback} />
        ) : (
          <p>No feedbacks found.</p>
        )}
      </div>
    </div>
  )
}

export default FeedbackPage