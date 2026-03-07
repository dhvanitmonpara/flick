import { z } from "zod";

export const branch = z.string().min(1, "Branch is required");

// Fallback default branches for UI if not fetched dynamically yet
export const defaultBranches = ["CSE", "BCA", "ECE", "IT", "ME"];
