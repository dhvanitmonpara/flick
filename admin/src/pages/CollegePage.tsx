import { useCallback, useEffect, useState } from "react";
import { http } from "@/services/http";
import { toast } from "sonner";
import { College } from "@/types/College";
import { CollegeTable } from "@/components/general/CollegeTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CollegePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create College Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emailDomain: "",
    city: "",
    state: "",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await http.post(`/colleges/create`, formData);

      if (res.status === 201) {
        toast.success("College created successfully!");
        setColleges((prev) => [res.data, ...prev]);
        setIsDialogOpen(false);
        setFormData({ name: "", emailDomain: "", city: "", state: "" });
      }
    } catch (error: any) {
      console.error("Error creating college:", error);
      toast.error(error.response?.data?.message || "Failed to create college.");
    } finally {
      setIsCreating(false);
    }
  };

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
            <form onSubmit={handleCreateCollege} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">College Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. University of Example"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="emailDomain">Email Domain</Label>
                <Input
                  id="emailDomain"
                  placeholder="e.g. @example.edu"
                  value={formData.emailDomain}
                  onChange={handleInputChange}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. San Francisco"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g. CA"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                >
                  {isCreating ? "Saving..." : "Save College"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className={`bg-zinc-800/50 px-3 w-full ${colleges.length === 0 && "min-h-52"} rounded-md`}>
        {colleges.length > 0 ? (
          <CollegeTable data={colleges} setCollege={setColleges} />
        ) : (
          <div className="p-4 text-center text-zinc-400">No colleges found.</div>
        )}
      </div>
    </div>
  );
}

export default CollegePage;