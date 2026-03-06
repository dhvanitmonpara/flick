import { Post } from "./Post";
import { User } from "./User";

interface Bookmark {
  id: string;
  userId: string | User;
  postId: string | Post;
}

export default Bookmark;
