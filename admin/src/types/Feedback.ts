export interface IFeedback {
  id: string;
  userId: {
    id: string;
    name: string;
    email: string;
    avatar?: string; // optional if you want to use images
  };
  type: "feedback" | "bug";
  title: string;
  content: string;
  status: "new" | "reviewed" | "dismissed";
}