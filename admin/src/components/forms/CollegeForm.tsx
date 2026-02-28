/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
});

type CollegeFormValues = z.infer<typeof collegeSchema>;

function CollegeForm({ defaultData, id, setOpen, setCollege }: {
  defaultData?: College | null,
  id?: string,
  setOpen?: (open: boolean) => void,
  setCollege: React.Dispatch<React.SetStateAction<College[]>>
}) {
  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [error, setError] = useState("");

  const isUpdating = !!defaultData

  const form = useForm<CollegeFormValues>({
    resolver: zodResolver(collegeSchema),
    defaultValues: defaultData ? {
      name: defaultData.name,
      emailDomain: defaultData.emailDomain,
      profile: defaultData.profile,
      city: availableCities.includes(defaultData.city as any) ? defaultData.city as (typeof availableCities)[number] : availableCities[0],
      state: availableStates.includes(defaultData.state as any) ? defaultData.state as (typeof availableStates)[number] : availableStates[0],
    } : {
      name: "",
      emailDomain: "",
      profile: "",
      city: availableCities[0],
      state: availableStates[0],
    }

  });

  const uploadProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("profile", file);

    setUploadingProfile(true);
    try {
      const res = await http.post<{ url: string }>(
        "/colleges/upload/profile",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedUrl = (res.data as { url?: string } | undefined)?.url;
      if (!uploadedUrl) {
        throw new Error("Failed to upload image");
      }

      form.setValue("profile", uploadedUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Profile image uploaded");
    } catch (uploadError) {
      console.error(uploadError);
      toast.error("Failed to upload profile image");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleProfileFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }

    await uploadProfileImage(file);
    event.target.value = "";
  };

  const onSubmit = async (data: CollegeFormValues) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        profile: data.profile?.trim() || undefined,
      };

      let res = null

      if (isUpdating) {
        res = await http.patch(`/colleges/update/${id}`, payload)
      } else {
        res = await http.post(`/colleges/create`, payload);
      }

      if (res.status !== (isUpdating ? 200 : 201)) throw new Error(`Failed to ${isUpdating ? "update" : "create"} college`);
      if (!res.data) throw new Error(`Failed to ${isUpdating ? "update" : "create"} college`);

      toast.success(`College ${isUpdating ? "updated" : "created"} successfully!`);
      form.reset();

      const college = res.data as College
      if (isUpdating) {
        setCollege(prev => prev.map((c) => c.id === college.id ? college : c))
      } else {
        setCollege((prev) => [
          ...prev,
          {
            id: college.id,
            name: college.name,
            emailDomain: college.emailDomain,
            profile: college.profile,
            city: college.city,
            state: college.state,
          }
        ])
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
          disabled={loading || uploadingProfile}
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200 file:text-zinc-100"
                  disabled={loading || uploadingProfile}
                />
                {uploadingProfile && (
                  <p className="text-xs text-zinc-400">Uploading image...</p>
                )}
              </div>
              <FormControl>
                <Input className="border-zinc-700 bg-zinc-700 focus:border-zinc-200 focus-visible:ring-zinc-200" type="url" placeholder="Or paste image URL" {...field} />
              </FormControl>
              {field.value && (
                <div className="rounded-md border border-zinc-700 bg-zinc-800 p-2">
                  <img src={field.value} alt="College profile preview" className="h-28 w-full rounded object-cover" />
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

        <Button disabled={loading || uploadingProfile || Boolean(error)} type="submit" className="w-full bg-zinc-200 hover:bg-zinc-300 text-zinc-900 disabled:bg-zinc-500">
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
