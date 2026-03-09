import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { http } from "@/services/http";
import { College } from "@/types/College";
import { CollegeRequest } from "@/types/CollegeRequest";
import CollegeForm from "../forms/CollegeForm";
import { ColumnDefinition, TableWrapper } from "./TableWrapper";

interface CollegeRequestTableProps {
  data: CollegeRequest[];
  setCollege: React.Dispatch<React.SetStateAction<College[]>>;
  setRequests: React.Dispatch<React.SetStateAction<CollegeRequest[]>>;
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export function CollegeRequestTable({
  data,
  setCollege,
  setRequests,
}: CollegeRequestTableProps) {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateRequestStatus = async (
    requestId: string,
    status: CollegeRequest["status"],
    resolvedCollegeId?: string,
  ) => {
    setUpdatingId(requestId);

    try {
      const res = await http.patch(`/college-requests/${requestId}`, {
        status,
        resolvedCollegeId,
      });

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? (res.data as CollegeRequest) : request,
        ),
      );
      toast.success(`Request ${status}`);
    } catch (error) {
      console.error("Failed to update college request", error);
      toast.error("Failed to update college request");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: ColumnDefinition<CollegeRequest>[] = [
    { key: "name", label: "College" },
    { key: "emailDomain", label: "Email Domain" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    {
      key: "requestedByEmail",
      label: "Requested By",
      render: (row) => row.requestedByEmail || "—",
    },
    {
      key: "createdAt",
      label: "Requested",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="capitalize text-zinc-300">{row.status}</span>
      ),
    },
  ];

  const renderActions = (request: CollegeRequest) => (
    <div className="flex justify-end gap-2">
      {request.status === "pending" ? (
        <>
          <Dialog
            open={openDialogId === request.id}
            onOpenChange={(isOpen) => setOpenDialogId(isOpen ? request.id : null)}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              >
                Approve
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-800 border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle>Create college from request</DialogTitle>
              </DialogHeader>
              <CollegeForm
                initialValues={request}
                setOpen={() => setOpenDialogId(null)}
                setCollege={setCollege}
                onSuccess={async (college) => {
                  await updateRequestStatus(request.id, "approved", college.id);
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            disabled={updatingId === request.id}
            onClick={() => updateRequestStatus(request.id, "rejected")}
          >
            Reject
          </Button>
        </>
      ) : (
        <span className="text-xs text-zinc-500">
          {request.status === "approved"
            ? `Resolved ${formatDate(request.resolvedAt)}`
            : `Closed ${formatDate(request.resolvedAt)}`}
        </span>
      )}
    </div>
  );

  return (
    <TableWrapper<CollegeRequest>
      data={data}
      columns={columns}
      renderActions={renderActions}
      rowClassName="hover:bg-zinc-800 group border-zinc-800"
      tableClassName="w-full overflow-x-auto"
    />
  );
}
