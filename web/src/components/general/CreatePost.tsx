import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import ModeratedText from "@/components/general/ModeratedText";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { postApi } from "@/services/api/post";
import { userApi } from "@/services/api/user";
import usePostStore from "@/store/postStore";
import useProfileStore from "@/store/profileStore";
import { PostTopic } from "@/types/postTopics";
import {
  censorText,
  loadModerationConfig,
  validateText,
} from "@/utils/moderation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { TermsForm } from "./TermsForm";

const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be at most 100 characters."),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters.")
    .max(2000, "Content must be at most 2000 characters."),
  topic: z.enum(PostTopic),
  isPrivate: z.boolean().default(false),
});

type PostFormValues = z.infer<typeof postSchema>;

type PostDefaultData = {
  title: string;
  content: string;
  topic?: PostFormValues["topic"];
  isPrivate?: boolean;
};

function CreatePost({
  className,
  children,
  defaultData,
}: {
  className?: string;
  children?: React.ReactNode;
  defaultData?: PostDefaultData;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            className={`flex items-center cursor-pointer space-x-3 px-4 py-4 rounded-md w-full justify-start text-lg font-normal dark:bg-transparent bg-zinc-100 text-zinc-800 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 ${className}`}
          >
            <FaPlus />
            <span>create</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <CreatePostForm setOpen={setOpen} defaultData={defaultData} />
      </DialogContent>
    </Dialog>
  );
}

export const CreatePostForm = ({
  setOpen,
  defaultData,
  id,
}: {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  defaultData?: PostDefaultData;
  id?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  const profile = useProfileStore((state) => state.profile);
  const addPost = usePostStore((state) => state.addPost);
  const updatePost = usePostStore((state) => state.updatePost);
  const { handleError } = useErrorHandler();

  const isUpdating = !!defaultData;

  const form = useForm<PostFormValues>({
    defaultValues: defaultData
      ? {
          title: defaultData.title,
          content: defaultData.content,
          topic: defaultData.topic ?? PostTopic[0],
          isPrivate: defaultData.isPrivate ?? false,
        }
      : {
          title: "",
          content: "",
          topic: PostTopic[0],
          isPrivate: false,
        },
  });

  const titleValue = form.watch("title");
  const contentValue = form.watch("content");
  const topicValue = form.watch("topic");
  const titleModeration = validateText(titleValue);
  const contentModeration = validateText(contentValue);
  const hasRequiredContent =
    titleValue.trim().length > 0 &&
    contentValue.trim().length > 0 &&
    Boolean(topicValue);
  const isSchemaValid = hasRequiredContent
    ? postSchema.safeParse({
        title: titleValue,
        content: contentValue,
        topic: topicValue,
        isPrivate: form.getValues("isPrivate"),
      }).success
    : false;
  const hasValidationError =
    !isSchemaValid ||
    !titleModeration.allowed ||
    !contentModeration.allowed;

  useEffect(() => {
    void loadModerationConfig();
  }, []);

  useEffect(() => {
    form.reset(
      defaultData
        ? {
          title: defaultData.title,
          content: defaultData.content,
          topic: defaultData.topic ?? PostTopic[0],
          isPrivate: defaultData.isPrivate ?? false,
        }
        : {
          title: "",
          content: "",
          topic: PostTopic[0],
          isPrivate: false,
        },
    );
  }, [defaultData, form]);

  const onSubmit = async (data: PostFormValues) => {
    try {
      if (!postSchema.safeParse(data).success) return;

      setLoading(true);

      if (!profile?.id) throw new Error("User not found");
      if (isUpdating && !id) throw new Error("Post id not found");

      await loadModerationConfig();
      const payload = {
        ...data,
        title: censorText(data.title),
        content: censorText(data.content),
      };

      let res = null;

      if (isUpdating) {
        res = await postApi.update(id as string, payload);
      } else {
        res = await postApi.create(payload);
      }

      if (res.status !== (isUpdating ? 200 : 201))
        throw new Error(`Failed to ${isUpdating ? "update" : "create"} post`);

      toast.success(`Post ${isUpdating ? "updated" : "created"} successfully!`);
      form.reset();

      if (isUpdating && id) {
        updatePost(id, res.data.post);
      } else {
        addPost(res.data.post);
      }

      if (setOpen) setOpen(false);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        const code = error.response.data.code;

        if (code === "TERMS_NOT_ACCEPTED") {
          setShowTerms(true);
        } else {
          toast.error("You are not allowed to perform this action.");
        }
        return;
      }
      await handleError(
        error as AxiosError | Error,
        "Failed to create post",
        setError,
        () => onSubmit(data),
        "Failed to create post",
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmitTerms = async () => {
    try {
      await userApi.acceptTerms();
      toast.success("Terms accepted!");
      setShowTerms(false);
      form.handleSubmit(onSubmit)();
    } catch (error) {
      handleError(error as AxiosError, "Failed to accept terms");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            disabled={loading}
            render={({ field }) => {
              const hasTitleWarning = !titleModeration.allowed;

              return (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      required
                      minLength={3}
                      maxLength={100}
                      aria-invalid={hasTitleWarning}
                      className={
                        hasTitleWarning
                          ? "border-red-500 bg-zinc-100 dark:bg-zinc-800 focus-visible:ring-red-500"
                          : "dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800"
                      }
                      placeholder="Enter post title"
                      {...field}
                      onChange={(e) => {
                        setError("");
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  {hasTitleWarning && (
                    <p className="text-red-500 text-xs mt-1">
                      {titleModeration.reason}
                    </p>
                  )}
                  {hasTitleWarning && field.value && (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">Preview:</span>
                      <ModeratedText text={field.value} />
                    </div>
                  )}
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            disabled={loading}
            name="topic"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Select
                      required
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {PostTopic.map((topic) => (
                          <SelectItem
                            className="focus:bg-zinc-200 dark:focus:bg-zinc-700"
                            key={topic}
                            value={topic}
                          >
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            disabled={loading}
            name="content"
            render={({ field }) => {
              const hasBanned = !contentModeration.allowed;

              return (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div>
                      <Textarea
                        rows={6}
                        required
                        maxLength={2000}
                        minLength={10}
                        placeholder="Write your post..."
                        {...field}
                        onChange={(e) => {
                          setError("");
                          field.onChange(e);
                        }}
                        aria-invalid={hasBanned}
                        className={
                          hasBanned
                            ? "border-red-500 bg-zinc-100 dark:bg-zinc-800 focus-visible:ring-red-500"
                            : "bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
                        }
                      />
                      {hasBanned && field.value && (
                        <div className="mt-2 text-sm">
                          <span className="font-semibold">Preview:</span>
                          <ModeratedText text={field.value} />
                        </div>
                      )}
                      {hasBanned && (
                        <p className="text-red-500 text-xs mt-1">
                          {contentModeration.reason}
                        </p>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-zinc-800 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-zinc-800 dark:text-zinc-200">
                    College-Only Post
                  </FormLabel>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Only users from your verified college email domain will see
                    this.
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={loading || hasValidationError || Boolean(error)}
            type="submit"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />{" "}
                {isUpdating ? "Updating..." : "Creating..."}
              </>
            ) : (
              isUpdating ? "Update" : "Create"
            )}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </Form>
      <TermsForm
        showTerms={showTerms}
        setShowTerms={setShowTerms}
        onSubmitTerms={onSubmitTerms}
      />
    </>
  );
};

export default CreatePost;
