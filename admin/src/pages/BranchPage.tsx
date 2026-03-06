import { useCallback, useEffect, useState } from "react";
import { http } from "@/services/http";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";

type Branch = {
  id: string;
  name: string;
  code: string;
};

function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await http.get(`/branches/all`);
      if (res.status === 200) {
        setBranches(res.data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to fetch branches.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCreate = async () => {
    if (!name || !code) return toast.error("Please fill all fields");
    setIsSaving(true);
    try {
      const res = await http.post(`/branches/create`, { name, code });
      if (res.status === 201) {
        toast.success("Branch created successfully");
        setBranches([...branches, res.data]);
        setIsDialogOpen(false);
        setName("");
        setCode("");
      }
    } catch (error) {
      toast.error("Failed to create branch");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    try {
      const res = await http.delete(`/branches/delete/${id}`);
      if (res.status === 200) {
        toast.success("Branch deleted successfully");
        setBranches(branches.filter((b) => b.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  if (isLoading) return <div className="p-6  text-zinc-400">Loading branches...</div>;

  return (
    <div className="p-6  flex flex-col gap-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Branches</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Create Branch</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Create Branch</DialogTitle>
              <DialogDescription className="text-zinc-400">Add a new branch.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm">Name</label>
                <Input className="border-zinc-700 bg-zinc-800" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="text-sm">Code</label>
                <Input className="border-zinc-700 bg-zinc-800" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CSE" />
              </div>
              <Button onClick={handleCreate} disabled={isSaving} className="w-full bg-zinc-200 text-zinc-900">
                {isSaving ? <Loader2 className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-zinc-800 rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Code</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((b) => (
              <TableRow key={b.id} className="border-zinc-800 hover:bg-zinc-800/50">
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.code}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {branches.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-zinc-400 h-24">No branches found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default BranchPage;
