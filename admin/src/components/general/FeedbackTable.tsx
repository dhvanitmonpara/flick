import { TableWrapper } from "./TableWrapper"
import { IFeedback } from "@/types/Feedback";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import { toast } from "sonner";
import axios from "axios";
import { env } from "@/config/env";

type FeedbackTableProps = {
  data: IFeedback[];
  setData: React.Dispatch<React.SetStateAction<IFeedback[]>>
};

export function FeedbackTable({
  data,
  setData
}: FeedbackTableProps) {
  const columns = [
    {
      key: "type",
      label: "Type",
      className: "py-0",
      render: (row: IFeedback) => (
        <div className={`h-12 w-3 ${row.type === "feedback" ? "bg-green-400" : "bg-red-400"}`}></div>
      )
    },
    {
      key: "title",
      label: "Title",
      render: (row: IFeedback) => (
        <span
          className="text-zinc-300 cursor-pointer truncate max-w-[200px]"
          onClick={() => navigator.clipboard.writeText(row.title)}
        >
          {row.title}
        </span>
      ),
    },
    {
      key: "content",
      label: "Content",
      render: (row: IFeedback) => (
        <span
          className="text-zinc-300 max-w-[200px]"
          onClick={() => navigator.clipboard.writeText(row.content)}
        >
          {row.content}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: IFeedback) => (
        <span
          className={{
            new: "text-yellow-400",
            reviewed: "text-blue-400",
            dismissed: "text-gray-400",
          }[row.status]}
        >
          {row.status}
        </span>
      ),
    },
    { key: "userId", label: "User" },
  ];

  const handleAction = async (id: string, action: "delete" | "review" | "dismiss") => {
    const toastId = toast.loading(action === "delete" ? "Deleting feedback" : "Updating feedback status")
    try {
      let res = null
      if (action === "delete") {
        res = await axios.delete(`${env.apiUrl}/manage/feedback/single/${id}`, { withCredentials: true })
      } else {
        res = await axios.patch(`${env.apiUrl}/manage/feedback/status/${id}`, { status: action === "review" ? "reviewed" : "dismissed" }, { withCredentials: true })
      }

      if (res.status !== 200) {
        toast.error(`Error ${action === "delete" ? "deleting" : "updating"} feedback`)
        return
      }

      if (action === "delete") {
        setData((prev) => prev.filter((feedback) => feedback._id !== id))
      } else {
        setData((prev) => prev.map((feedback) => feedback._id === id ? { ...feedback, status: action === "review" ? "reviewed" : "dismissed" } : feedback))
      }
      toast.success(`Feedback ${action === "delete" ? "deleted" : (action === "review" ? "reviewed" : "dismissed")} successfully`)

    } catch (error) {
      console.log(error)
      toast.error(`Error ${action === "delete" ? "deleting" : "updating"} feedback`)
    } finally {
      toast.dismiss(toastId)
    }
  }

  const renderActions = (row: IFeedback) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-zinc-100 bg-zinc-700 rounded-md">
            <HiDotsHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-700 text-zinc-100 border-zinc-700" align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row._id, "review")}>
            Mark As Reviewed
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row._id, "dismiss")}>
            Mark As Dismissed
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row._id, "delete")}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <TableWrapper<IFeedback>
      data={data}
      columns={columns}
      renderActions={renderActions}
    />
  );
}
