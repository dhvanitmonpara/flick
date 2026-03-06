export interface Feedback {
  id: string;
  userId: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  type: "feedback" | "bug";
  title: string;
  content: string;
  status: "new" | "reviewed" | "dismissed";
}
