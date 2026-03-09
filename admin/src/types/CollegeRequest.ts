export interface CollegeRequest {
  id: string;
  name: string;
  emailDomain: string;
  city: string;
  state: string;
  requestedByEmail: string | null;
  status: "pending" | "approved" | "rejected";
  resolvedCollegeId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
