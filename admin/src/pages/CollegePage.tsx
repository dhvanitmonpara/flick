import { useCallback, useEffect, useState } from "react";
import { http } from "@/services/http";
import { toast } from "sonner";
import { College } from "@/types/College";
import { CollegeTable } from "@/components/general/CollegeTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CollegeForm from "@/components/forms/CollegeForm";

function CollegePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchColleges = useCallback(async () => {
    try {
      const res = await http.get(`/colleges/get/all`);
      if (res.status !== 200) {
        toast.error("Failed to fetch colleges.");
        return;
      }
      setColleges(res.data.colleges);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast.error("Failed to fetch colleges.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  if (isLoading) return <div className="p-6 col-span-10 text-muted-foreground">Loading colleges...</div>;

  return (
    <div className="p-6 col-span-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Colleges</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Create College</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Create College</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new college to the platform. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <CollegeForm setCollege={setColleges} setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {colleges.length > 0 ? (
        <CollegeTable data={colleges} setCollege={setColleges} />
      ) : (
        <div className={`bg-zinc-800/50 px-3 w-full ${colleges.length === 0 && "min-h-52"} rounded-md`}>
          <div className="p-4 text-center text-zinc-400">No colleges found.</div>
        </div>
      )}
    </div>
  );
}

export default CollegePage;
