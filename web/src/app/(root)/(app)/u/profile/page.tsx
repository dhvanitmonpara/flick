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
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import type { User as UserEntity } from "@/types/User";
import type { College as CollegeEntity } from "@/types/College";
import type { Post as PostEntity } from "@/types/Post";
import Post from "@/components/general/Post";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonCard from "@/components/skeletons/PostSkeleton";
import { userApi } from "@/services/api/user";
import { postApi } from "@/services/api/post";
import { collegeApi, type Branch } from "@/services/api/college";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2, GraduationCap, BookOpen, Flame } from "lucide-react";

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const user = useProfileStore((state) => state.profile);

  useEffect(() => {
    (async () => {
      // Always use the dedicated endpoint that returns user + college in one call
      const response = await userApi.getProfileWithCollege();
      if (response.status === 200) {
        const userData = response.data;
        setProfile({ ...userData, posts: [] });
        setEditBranch(userData.branch || "");
        fetchUserPosts(userData.id);
      } else {
        console.error("Failed to fetch profile data");
      }
    })();
  }, [user.id]);

  // Load branches when the edit modal opens
  useEffect(() => {
    if (!isEditModalOpen) return;
    const collegeId = profile?.collegeId;
    if (!collegeId) return;

    setLoadingBranches(true);
    collegeApi
      .getCollegeBranches(collegeId)
      .then((data) => setBranches(data))
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, [isEditModalOpen, profile?.collegeId]);

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
      toast.error("Please select a branch");
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
    <div className="pb-8 md:pb-12 w-full max-w-5xl mx-auto">
      {profile ? (
        <>
          <div className="relative">
            {/* Banner Background */}
            <div className="h-32 md:h-48 w-full bg-linear-to-r from-primary/20 via-primary/5 to-zinc-100 dark:to-zinc-900 md:rounded-b-2xl border-b border-zinc-200 dark:border-zinc-800" />

            {/* Avatar positioned outside to overlap */}
            <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-8">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background bg-background shadow-sm transition-transform duration-300 hover:scale-[1.02]">
                <AvatarImage
                  src={
                    isCollege(profile.college)
                      ? profile.college.profile
                      : undefined
                  }
                  alt={profile.username}
                  className="object-cover"
                />
                <AvatarFallback className="bg-zinc-200 cursor-pointer select-none text-2xl md:text-3xl font-medium">
                  {profile.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="mt-14 md:mt-20 px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {profile.username}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-4 text-sm md:text-base">
                  <Badge
                    variant="secondary"
                    className="gap-1.5 font-normal px-2.5 py-0.5 rounded-full"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-zinc-500" />
                    {isCollege(profile.college)
                      ? profile.college.name
                      : "Unknown College"}
                  </Badge>

                  {profile.branch && (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 font-normal px-2.5 py-0.5 rounded-full"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                      {profile.branch}
                    </Badge>
                  )}

                  <Badge
                    variant="secondary"
                    className="gap-1.5 font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-800"
                  >
                    <Flame className="h-3.5 w-3.5" />
                    {profile.karma} Karma
                  </Badge>
                </div>
              </div>

              <div className="shrink-0 mt-2 md:mt-0">
                <Dialog
                  open={isEditModalOpen}
                  onOpenChange={setIsEditModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 shadow-sm rounded-full px-4"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
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
                        <div className="col-span-3">
                          {loadingBranches ? (
                            <Skeleton className="h-10 w-full rounded-md" />
                          ) : (
                            <Select
                              value={editBranch}
                              onValueChange={setEditBranch}
                            >
                              <SelectTrigger id="branch" className="w-full">
                                <SelectValue placeholder="Select a branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.length > 0 ? (
                                  branches.map((b) => (
                                    <SelectItem key={b.id} value={b.name}>
                                      {b.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value={editBranch || "_none"} disabled>
                                    No branches available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleSaveProfile}
                        disabled={isSaving || loadingBranches}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-12 px-4 md:px-8">
            <h3 className="text-lg font-semibold mb-6 border-b-2 border-primary/20 w-max pb-1 pr-8">
              Activity
            </h3>
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
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 max-w-2xl mx-auto my-8">
                <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="w-10 h-10 opacity-80" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                  No posts yet
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-base">
                  When this user starts sharing their thoughts and ideas,
                  they&apos;ll appear right here.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <ProfileSkeleton />
          <div className="mt-10 px-4 md:px-8 space-y-6">
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
    <div className="w-full">
      <div className="relative">
        <Skeleton className="h-32 md:h-48 w-full md:rounded-b-2xl rounded-none" />
        <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-8">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-background" />
        </div>
      </div>
      <div className="mt-14 md:mt-20 px-4 md:px-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-4 w-full md:w-auto">
          <Skeleton className="h-9 w-48 max-w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-full hidden md:block" />
      </div>
    </div>
  );
}

export default ProfilePage;
