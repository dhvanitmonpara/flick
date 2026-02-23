import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { env } from "@/config/env";
import { toast } from "sonner";
import { ICollege } from "@/types/College";
import { CollegeTable } from "@/components/general/CollegeTable";

function CollegePage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchColleges = useCallback(async () => {
    try {
      const res = await axios.get(`${env.apiUrl}/colleges/get/all`, { withCredentials: true });
      if (res.status !== 200) {
        toast.error("Failed to fetch colleges.");
        return;
      }
      setColleges(res.data.data.colleges);
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

  if (isLoading) return <div>Loading colleges...</div>;

  return (
    <div className="p-6 col-span-10">
      <div className={`bg-zinc-800/50 px-3 w-full ${colleges.length === 0 && "min-h-52"} rounded-md`}>
        {colleges.length > 0 ? (
          <CollegeTable data={colleges} setCollege={setColleges} />
        ) : (
          <div>No colleges found.</div>
        )}
      </div>
    </div>
  );
}

export default CollegePage;