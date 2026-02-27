import { TableWrapper } from "./TableWrapper"
import { Feedback } from "@/types/Feedback";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { HiDotsHorizontal } from "react-icons/hi";
import { toast } from "sonner";
import { rootHttp } from "@/services/http";

type FeedbackTableProps = {
  data: Feedback[];
  setData: React.Dispatch<React.SetStateAction<Feedback[]>>
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
      render: (row: Feedback) => (
        <div className={`h-12 w-3 ${row.type === "feedback" ? "bg-green-400" : "bg-red-400"}`}></div>
      )
    },
    {
      key: "title",
      label: "Title",
      render: (row: Feedback) => (
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
      render: (row: Feedback) => (
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
      render: (row: Feedback) => (
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
        res = await rootHttp.delete(`/feedbacks/${id}`)
      } else {
        res = await rootHttp.patch(`/feedbacks/${id}/status`, { status: action === "review" ? "reviewed" : "dismissed" })
      }

      if (res.status !== 200) {
        toast.error(`Error ${action === "delete" ? "deleting" : "updating"} feedback`)
        return
      }

      if (action === "delete") {
        setData((prev) => prev.filter((feedback) => feedback.id !== id))
      } else {
        setData((prev) => prev.map((feedback) => feedback.id === id ? { ...feedback, status: action === "review" ? "reviewed" : "dismissed" } : feedback))
      }
      toast.success(`Feedback ${action === "delete" ? "deleted" : (action === "review" ? "reviewed" : "dismissed")} successfully`)

    } catch (error) {
      console.log(error)
      toast.error(`Error ${action === "delete" ? "deleting" : "updating"} feedback`)
    } finally {
      toast.dismiss(toastId)
    }
  }

  const renderActions = (row: Feedback) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-zinc-100 bg-zinc-700 rounded-md">
            <HiDotsHorizontal />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-700 text-zinc-100 border-zinc-700" align="end">
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row.id, "review")}>
            Mark As Reviewed
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row.id, "dismiss")}>
            Mark As Dismissed
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-500/70" />
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleAction(row.id, "delete")}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <TableWrapper<Feedback>
      data={data}
      columns={columns}
      renderActions={renderActions}
    />
  );
}
