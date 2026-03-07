"use client";

import useProfileStore from "@/store/profileStore";
import {
  formatDate,
  getAvatarUrl,
  getCollegeName,
  isCollege,
  isUser,
} from "@/utils/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BsDot } from "react-icons/bs";
import { useEffect, useState } from "react";
import type { User as UserEntity } from "@/types/User";
import type { College as CollegeEntity } from "@/types/College";
import type { Post as PostEntity } from "@/types/Post";
import Post from "@/components/general/Post";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeletons/PostSkeleton";
import { userApi } from "@/services/api/user";
import { postApi } from "@/services/api/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

interface Profile extends UserEntity {
  college: CollegeEntity;
  posts: PostEntity[];
  karma: number;
}

function ProfilePage() {
  const [profile, setProfile] = useState<null | Profile>(null);
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const user = useProfileStore((state) => state.profile);

  useEffect(() => {
    if (!user.id) {
      (async () => {
        const response = await userApi.getProfile();

        if (response.status === 200) {
          setProfile({ ...response.data, posts: [] });
          setEditBranch(response.data.branch || "");
          fetchUserPosts(response.data.id);
        } else {
          console.error("Failed to fetch profile data");
        }
      })();
    } else {
      setProfile({ ...user, posts: [] } as any);
      setEditBranch(user.branch || "");
      fetchUserPosts(user.id);
    }
  }, [user.id]);

  async function fetchUserPosts(userId: string) {
    try {
      setLoadingPosts(true);
      const res = await postApi.getByUser(userId);
      if (res.status === 200) {
        setPosts(res.data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoadingPosts(false);
    }
  }

  const handleSaveProfile = async () => {
    if (!editBranch.trim()) {
      toast.error("Branch cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await userApi.updateProfile({ branch: editBranch });
      if (res.status === 200) {
        toast.success("Profile updated successfully");
        setProfile((prev) => (prev ? { ...prev, branch: editBranch } : null));
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4 md:px-0">
      {profile ? (
        <>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 pb-6 pt-4">
            <Avatar className="cursor-pointer w-24 h-24 md:w-28 md:h-28 transition-colors duration-300 border-2 border-transparent hover:border-zinc-400">
              <AvatarImage
                src={
                  isCollege(profile.college)
                    ? profile.college.profile
                    : "Unknown College"
                }
                alt={profile.username}
              />
              <AvatarFallback className="bg-zinc-200 cursor-pointer select-none text-xl">
                {profile.username?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mt-2 md:mt-0">
                <h4 className="text-2xl font-semibold">{profile.username}</h4>
                <Dialog
                  open={isEditModalOpen}
                  onOpenChange={setIsEditModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={profile.username}
                          className="col-span-3"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">
                          Branch
                        </Label>
                        <Input
                          id="branch"
                          value={editBranch}
                          onChange={(e) => setEditBranch(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-zinc-600 dark:text-zinc-500 flex flex-wrap justify-center md:justify-start items-center gap-x-0.5 gap-y-1 mt-3 md:mt-2 text-sm md:text-base">
                <span>
                  {isCollege(profile.college)
                    ? profile.college.name
                    : "Unknown College"}
                </span>
                <BsDot size={20} className="hidden md:block" />
                <span className="hidden md:inline">{profile.branch}</span>
                <BsDot size={20} className="hidden md:block" />
                <span className="hidden md:inline">{profile.karma} Karma</span>
              </p>
              <p className="text-zinc-600 dark:text-zinc-500 flex md:hidden justify-center items-center gap-x-0.5 mt-1 text-sm">
                <span>{profile.branch}</span>
                <BsDot size={20} />
                <span>{profile.karma} Karma</span>
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-2">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Posts</h3>
            {loadingPosts ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const postedBy = post.postedBy;

                if (!isUser(postedBy)) {
                  // postedBy is just a string, fallback
                  return (
                    <Post
                      key={post.id}
                      id={post.id}
                      avatar=""
                      userVote={post.userVote ?? null}
                      username="Unknown"
                      title={post.title}
                      topic={post.topic}
                      isPrivate={post.isPrivate}
                      bookmarked={post.bookmarked ?? false}
                      branch="Unknown"
                      viewsCount={post.views}
                      content={post.content}
                      avatarFallback=""
                      college="Unknown"
                      createdAt={formatDate(post.createdAt)}
                      upvoteCount={post.upvoteCount}
                      downvoteCount={post.downvoteCount}
                      commentsCount={post.commentsCount ?? 0}
                    />
                  );
                }

                // postedBy is a full User object here
                return (
                  <Post
                    key={post.id}
                    id={post.id}
                    avatar={getAvatarUrl(postedBy)}
                    college={getCollegeName(postedBy)}
                    topic={post.topic}
                    isPrivate={post.isPrivate}
                    username={postedBy.username}
                    userVote={post.userVote ?? null}
                    title={post.title}
                    bookmarked={post.bookmarked ?? false}
                    branch={postedBy.branch}
                    viewsCount={post.views}
                    content={post.content}
                    avatarFallback=""
                    createdAt={formatDate(post.createdAt)}
                    upvoteCount={post.upvoteCount}
                    downvoteCount={post.downvoteCount}
                    commentsCount={post.commentsCount ?? 0}
                  />
                );
              })
            ) : (
              <div className="flex justify-center items-center h-32 border border-dashed rounded-lg text-muted-foreground">
                <p>No posts found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <ProfileSkeleton />
          <div className="mt-6 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 pb-6 pt-4">
      <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full" />
      <div className="space-y-3 flex flex-col items-center md:items-start mt-2 md:mt-0">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-4 rounded-full hidden md:block" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-4 rounded-full hidden md:block" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
