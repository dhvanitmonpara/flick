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
import { TableWrapper, ColumnDefinition } from "@/components/general/TableWrapper";
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

  const columns: ColumnDefinition<BannedWord>[] = [
    {
      key: "word",
      label: "Word / Phrase",
      className: "font-medium",
    },
    {
      key: "severity",
      label: "Severity",
      render: (row) => (
        <Badge className={getSeverityBadgeColor(row.severity)}>
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "strictMode",
      label: "Mode",
      render: (row) => (
        <Badge variant={row.strictMode ? "destructive" : "secondary"}>
          {row.strictMode ? "Strict" : "Normal"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Added On",
      render: (row) => format(new Date(row.createdAt), "MMM d, yyyy"),
    },
  ];

  return (
    <div className="p-6 col-span-10">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-2xl font-semibold text-zinc-100">Banned Words</p>
          <p className="text-sm text-zinc-400 mt-1">
            Manage words and phrases that are globally banned or restricted.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700">
          <Plus className="mr-2 h-4 w-4" /> Add Word
        </Button>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 shrink-0 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search words..."
            className="pl-8 border-zinc-800 bg-zinc-800 text-zinc-100 focus:border-zinc-200 focus-visible:ring-zinc-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-800/20 flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-800/20 flex items-center justify-center h-32 text-zinc-400">
          No banned words found.
        </div>
      ) : (
        <TableWrapper
          data={filteredWords}
          columns={columns}
          renderActions={(word) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={() => handleOpenDialog(word)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-400 hover:bg-red-950/50"
                onClick={() => handleDelete(word.id, word.word)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{editingWord ? "Edit" : "Add"} Banned Word</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {editingWord
                ? "Update the configuration for this banned word."
                : "Add a new word or phrase to the global blocklist."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-zinc-200">Word or Phrase</Label>
              <Input
                placeholder="e.g. badword123"
                className="border-zinc-800 bg-zinc-900 text-zinc-100 focus:border-zinc-200 focus-visible:ring-zinc-200"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-200">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(val: BannedWordSeverity) =>
                  setFormData({ ...formData, severity: val })
                }
              >
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-100 focus:ring-zinc-200">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                  <SelectItem value="mild" className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">Mild</SelectItem>
                  <SelectItem value="moderate" className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">Moderate</SelectItem>
                  <SelectItem value="severe" className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="space-y-0.5">
                <Label className="text-zinc-200">Strict Mode</Label>
                <p className="text-sm text-zinc-400">
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
            <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200" onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingWord ? "Save Changes" : "Add Word"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
