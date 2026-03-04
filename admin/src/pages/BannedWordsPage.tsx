import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  BannedWord,
  BannedWordSeverity,
  moderationApi,
  ModerationWordPayload,
  ModerationWordUpdatePayload,
} from "@/services/api/moderation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BannedWordsPage() {
  const [words, setWords] = useState<BannedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<BannedWord | null>(null);

  const [formData, setFormData] = useState<ModerationWordPayload>({
    word: "",
    severity: "moderate",
    strictMode: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const res = await moderationApi.listWords();
      setWords(res?.words ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch banned words");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (word?: BannedWord) => {
    if (word) {
      setEditingWord(word);
      setFormData({
        word: word.word,
        severity: word.severity,
        strictMode: word.strictMode,
      });
    } else {
      setEditingWord(null);
      setFormData({
        word: "",
        severity: "moderate",
        strictMode: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.word.trim()) {
      toast.error("Word cannot be empty");
      return;
    }

    try {
      setSaving(true);
      if (editingWord) {
        const updatePayload: ModerationWordUpdatePayload = {};
        if (formData.word !== editingWord.word) updatePayload.word = formData.word;
        if (formData.severity !== editingWord.severity) updatePayload.severity = formData.severity;
        if (formData.strictMode !== editingWord.strictMode) updatePayload.strictMode = formData.strictMode;

        if (Object.keys(updatePayload).length > 0) {
          const res = await moderationApi.updateWord(editingWord.id, updatePayload);
          setWords((prev) =>
            prev.map((w) => (w.id === editingWord.id ? res.data!.word : w))
          );
          toast.success("Banned word updated successfully");
        }
      } else {
        const res = await moderationApi.createWord(formData);
        setWords((prev) => [res.data!.word, ...prev]);
        toast.success("Banned word added successfully");
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save banned word");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`Are you sure you want to delete the banned word "${word}"?`)) return;

    try {
      await moderationApi.deleteWord(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      toast.success("Banned word deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete banned word");
    }
  };

  const filteredWords = words.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase())
  );

  const getSeverityBadgeColor = (severity: BannedWordSeverity) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "moderate":
        return "bg-orange-500 hover:bg-orange-600";
      case "severe":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-zinc-500 hover:bg-zinc-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banned Words</h2>
          <p className="text-muted-foreground">
            Manage words and phrases that are globally banned or restricted.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Word / Phrase</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredWords.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No banned words found.
                </TableCell>
              </TableRow>
            ) : (
              filteredWords.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityBadgeColor(word.severity)}>
                      {word.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={word.strictMode ? "destructive" : "secondary"}>
                      {word.strictMode ? "Strict" : "Normal"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(word.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(word)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => handleDelete(word.id, word.word)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingWord ? "Edit" : "Add"} Banned Word</DialogTitle>
            <DialogDescription>
              {editingWord
                ? "Update the configuration for this banned word."
                : "Add a new word or phrase to the global blocklist."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Word or Phrase</Label>
              <Input
                placeholder="e.g. badword123"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(val: BannedWordSeverity) =>
                  setFormData({ ...formData, severity: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Strict Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Bypass leetspeak evasions (e.g. "@" for "a") and ignore punctuation.
                </p>
              </div>
              <Switch
                checked={formData.strictMode}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, strictMode: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingWord ? "Save Changes" : "Add Word"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
