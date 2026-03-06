import { College } from "@/types/College";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import CollegeForm from "../forms/CollegeForm";
import { ColumnDefinition, TableWrapper } from "./TableWrapper";

interface CollegeTableProps {
  data: College[];
  setCollege: React.Dispatch<React.SetStateAction<College[]>>;
}

export function CollegeTable({ data, setCollege }: CollegeTableProps) {
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  const columns: ColumnDefinition<College>[] = [
    { key: "name", label: "Name" },
    {
      key: "profile",
      label: "Profile",
      render: (row) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              onClick={() => {
                navigator.clipboard.writeText(row.profile);
                toast.success("Copied to clipboard");
              }}
              className="text-blue-500 underline cursor-pointer"
            >
              View
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-48 p-2 bg-zinc-800 border-zinc-800">
            <img
              src={row.profile}
              alt="Profile"
              className="w-full h-40 object-cover rounded"
            />
          </HoverCardContent>
        </HoverCard>
      ),
    },
    { key: "emailDomain", label: "Email Domain" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    {
      key: "branches",
      label: "Branches",
      render: (row) => <span>{row.branches?.join(", ") || ""}</span>
    },
  ];

  const renderActions = (college: College) => (
    <Dialog open={openDialogId === college.id} onOpenChange={(isOpen) => setOpenDialogId(isOpen ? college.id : null)}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100" size="sm">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-800 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Edit College</DialogTitle>
        </DialogHeader>
        <CollegeForm
          defaultData={college}
          setOpen={() => setOpenDialogId(null)}
          setCollege={setCollege}
          id={college.id}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <TableWrapper<College>
      data={data}
      columns={columns}
      renderActions={renderActions}
      rowClassName="hover:bg-zinc-800 group border-zinc-800"
      tableClassName="w-full overflow-x-auto"
    />
  );
}
