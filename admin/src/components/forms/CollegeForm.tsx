/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { College } from "@/types/College";
import { http } from "@/services/http";
import { Label } from "@/components/ui/label";

const availableCities = ["Ahmedabad"] as const;
const availableStates = ["Gujarat"] as const;

const collegeSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  profile: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().url().safeParse(value).success, {
      message: "Invalid URL",
    }),
  emailDomain: z.string().min(3, { message: "Email domain must be at least 3 characters" }),
  city: z.enum(availableCities),
  state: z.enum(availableStates),
  branches: z.array(z.string()).min(1, { message: "Select at least one branch" }),
});

type CollegeFormValues = z.infer<typeof collegeSchema>;

type Branch = { id: string; name: string; code: string };

function CollegeForm({ defaultData, id, setOpen, setCollege }: {
  defaultData?: College | null,
  id?: string,
  setOpen?: (open: boolean) => void,
  setCollege: React.Dispatch<React.SetStateAction<College[]>>
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await http.get("/branches/all");
        setAvailableBranches(res.data);
      } catch (err) {
        console.error("Failed to fetch branches", err);
      }
    };
    fetchBranches();
  }, []);

  // Store a pending file for upload after college creation
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUpdating = !!defaultData;

  const form = useForm<CollegeFormValues>({
    resolver: zodResolver(collegeSchema),
    defaultValues: defaultData ? {
      name: defaultData.name,
      emailDomain: defaultData.emailDomain,
      profile: defaultData.profile,
      city: availableCities.includes(defaultData.city as any) ? defaultData.city as (typeof availableCities)[number] : availableCities[0],
      state: availableStates.includes(defaultData.state as any) ? defaultData.state as (typeof availableStates)[number] : availableStates[0],
      branches: defaultData.branches || [],
    } : {
      name: "",
      emailDomain: "",
      profile: "",
      city: availableCities[0],
      state: availableStates[0],
      branches: [],
    }
  });

  /**
   * Upload an image file to Cloudinary via the backend upload endpoint.
   * Requires a valid college `id`.
   */
  const uploadProfileImage = async (file: File, collegeId: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("profile", file);

    try {
      const res = await http.post<{ url: string }>(
        `/colleges/upload/profile/${collegeId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedUrl = (res.data as { url?: string } | undefined)?.url;
      if (!uploadedUrl) {
        throw new Error("Failed to upload image");
      }

      return uploadedUrl;
    } catch (uploadError) {
      console.error(uploadError);
      toast.error("Failed to upload profile image");
      return null;
    }
  };

  /**
   * Fetch an image from a web URL and convert it to a File object
   * so it can be uploaded to Cloudinary.
   */
  const fetchImageAsFile = async (url: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

      const blob = await response.blob();
      const contentType = blob.type || "image/png";
      const extension = contentType.split("/")[1] || "png";
      const fileName = `college-logo.${extension}`;

      return new File([blob], fileName, { type: contentType });
    } catch (err) {
      console.error("Failed to fetch image from URL:", err);
      toast.error("Failed to fetch image from the provided URL");
      return null;
    }
  };

  /**
   * Determine if a URL is already a Cloudinary URL (already uploaded).
   */
  const isCloudinaryUrl = (url: string) => {
    return url.includes("res.cloudinary.com");
  };

  const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    setPendingFile(file);
    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    // Clear the text URL field since we're using a file now
    form.setValue("profile", "", { shouldDirty: true });
  };

  const clearPendingFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setPendingFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CollegeFormValues) => {
    try {
      setLoading(true);
      setError("");

      const profileUrl = data.profile?.trim() || undefined;
      const hasPendingFile = !!pendingFile;
      const hasWebUrl = !!profileUrl && !isCloudinaryUrl(profileUrl);

      // Step 1: Create or update the college (without profile if we need to upload)
      const payload = {
        ...data,
        profile: (hasPendingFile || hasWebUrl) ? undefined : profileUrl,
      };

      let res = null;

      if (isUpdating) {
        res = await http.patch(`/colleges/update/${id}`, payload);
      } else {
        res = await http.post(`/colleges/create`, payload);
      }

      if (res.status !== (isUpdating ? 200 : 201)) throw new Error(`Failed to ${isUpdating ? "update" : "create"} college`);
      if (!res.data) throw new Error(`Failed to ${isUpdating ? "update" : "create"} college`);

      const college = res.data as College;
      const collegeId = college.id;

      // Step 2: Handle image upload if needed
      let finalProfileUrl = college.profile;

      if (hasPendingFile) {
        // Upload the selected file to Cloudinary
        const uploaded = await uploadProfileImage(pendingFile, collegeId);
        if (uploaded) {
          finalProfileUrl = uploaded;
        }
      } else if (hasWebUrl) {
        // Fetch the web URL image and upload to Cloudinary
        const file = await fetchImageAsFile(profileUrl);
        if (file) {
          const uploaded = await uploadProfileImage(file, collegeId);
          if (uploaded) {
            finalProfileUrl = uploaded;
          }
        }
      }

      toast.success(`College ${isUpdating ? "updated" : "created"} successfully!`);
      form.reset();
      clearPendingFile();

      const finalCollege: College = {
        id: collegeId,
        name: college.name,
        emailDomain: college.emailDomain,
        profile: finalProfileUrl,
        city: college.city,
        state: college.state,
        branches: college.branches,
      };

      if (isUpdating) {
        setCollege(prev => prev.map((c) => c.id === finalCollege.id ? finalCollege : c));
      } else {
        setCollege((prev) => [...prev, finalCollege]);
      }

      if (setOpen) setOpen(false);
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setError(error.response.data.message);
        }
      }
      toast.error(`Failed to ${isUpdating ? "update" : "create"} college`);
    } finally {
      setLoading(false);
    }
  };

  // Determine what preview to show: pending file preview > form URL value
  const formProfileValue = form.watch("profile");
  const previewUrl = filePreviewUrl || (formProfileValue ? formProfileValue : null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          disabled={loading}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200" placeholder="Enter College Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailDomain"
          disabled={loading}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200" placeholder="Enter Email Domain" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profile"
          disabled={loading}
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200 file:text-zinc-100"
                  disabled={loading}
                />
                {pendingFile && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Selected: {pendingFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={clearPendingFile}
                      className="text-xs text-zinc-400 hover:text-zinc-200 underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              <FormControl>
                <Input
                  className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200"
                  type="url"
                  placeholder="Or paste image URL"
                  {...field}
                  disabled={loading || !!pendingFile}
                  onChange={(e) => {
                    field.onChange(e);
                    // If user types a URL, clear any pending file
                    if (e.target.value) {
                      clearPendingFile();
                    }
                  }}
                />
              </FormControl>
              {previewUrl && (
                <div className="rounded-md border border-zinc-700 bg-zinc-800 p-2">
                  <img src={previewUrl} alt="College profile preview" className="h-28 w-full rounded object-cover" />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(value) => field.onChange(value as typeof availableCities[number])}
                value={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          disabled={loading}
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
                <FormControl>
                  <SelectTrigger className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branches"
          render={({ field }) => (
            <FormItem>
              <Label>Branches</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableBranches.map((branch) => {
                  const isChecked = field.value?.includes(branch.id);
                  return (
                    <label key={branch.id} className="flex items-center space-x-2 text-sm text-zinc-300">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            field.onChange([...(field.value || []), branch.id]);
                          } else {
                            field.onChange((field.value || []).filter((v) => v !== branch.id));
                          }
                        }}
                        className="rounded border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-zinc-200"
                      />
                      <span>{branch.name} ({branch.code})</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading || Boolean(error)} type="submit" className="w-full bg-zinc-200 hover:bg-zinc-300 text-zinc-900 disabled:bg-zinc-500">
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> {isUpdating ? "Updating..." : "Creating..."}
            </>
          ) : (
            isUpdating ? "Update" : "Create"
          )}
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </Form>
  )
}

export default CollegeForm
