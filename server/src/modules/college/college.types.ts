type CollegeUpdates = {
	name?: string;
	emailDomain?: string;
	city?: string;
	state?: string;
	profile?: string;
	branches?: string[];
};

type CreateCollegeRequestInput = {
	name: string;
	emailDomain: string;
	city: string;
	state: string;
	requestedByEmail: string;
};

type UpdateCollegeRequestInput = {
	status: "approved" | "rejected" | "pending";
	resolvedCollegeId?: string;
};

export type {
	CollegeUpdates,
	CreateCollegeRequestInput,
	UpdateCollegeRequestInput,
};
