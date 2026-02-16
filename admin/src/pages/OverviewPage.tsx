import { env } from "@/config/env";
import axios from "axios";
import { useEffect } from "react"

function OverviewPage() {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${env.apiUrl}/dashboard/overview`,{
          withCredentials: true
        });
        console.log(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [])

  return (
    <div>
      overview
    </div>
  )
}

export default OverviewPage