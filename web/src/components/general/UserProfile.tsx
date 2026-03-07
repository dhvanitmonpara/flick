import useProfileStore from "@/store/profileStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "@/types/User";
import { isCollege, isUser } from "@/utils/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { FaUser } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import {
  IoBookmarkSharp,
  IoSettingsSharp,
  IoLogOutOutline,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { toast } from "sonner";
import { SignInButton } from "./AuthCard";
import { authClient } from "@/lib/auth-client";

const getCollegeProfile = (user: User | string | null) =>
  isUser(user) && isCollege(user.college)
    ? user.college.profile
    : "Unknown College";

function UserProfile() {
  const profile = useProfileStore((state) => state.profile);
  const removeProfile = useProfileStore((state) => state.removeProfile);
  const navigate = useRouter().push;

  const handleLogout = async () => {
    try {
      await authApi.session.logout();
      await authClient.signOut();
      removeProfile();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      {profile?.id ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer transition-colors duration-300 border-2 border-transparent hover:border-zinc-400">
              <AvatarImage
                src={getCollegeProfile(profile)}
                alt={profile.username}
              />
              <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 cursor-pointer select-none">
                {profile.username.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => navigate("/u/profile")}
              className="flex items-center space-x-1 px-1"
            >
              <FaUser size={12} />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/u/bookmarks")}
              className="flex items-center space-x-1 px-1"
            >
              <IoBookmarkSharp size={12} />
              <span>Bookmarks</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/feedback")}
              className="flex items-center space-x-1 px-1"
            >
              <MdFeedback size={12} />
              <span>Feedback</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/u/settings")}
              className="flex items-center space-x-1 px-1"
            >
              <IoSettingsSharp size={14} />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center space-x-1 px-1 text-red-500 focus:text-red-500"
            >
              <IoLogOutOutline size={14} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignInButton />
      )}
    </>
  );
}

export default UserProfile;
