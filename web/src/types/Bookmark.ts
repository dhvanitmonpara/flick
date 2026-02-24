import { IPost } from "./Post";
import { IUser } from "./User";

interface IBookmark {
  id: string;
  userId: string | IUser;
  postId: string | IPost
}

export default IBookmark