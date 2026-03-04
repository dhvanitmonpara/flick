import { HttpError } from "@/core/http";
import { moderationService } from "@/infra/services/moderator";
import {
  createBannedWord,
  deleteBannedWord,
  getModerationConfigWords,
  listBannedWords,
  updateBannedWord,
  type BannedWordSeverity,
} from "./words-moderation.repo";

class WordsModerationService {
  async getConfig() {
    return getModerationConfigWords();
  }

  async listWords() {
    return listBannedWords();
  }

  async createWord(payload: {
    word: string;
    strictMode?: boolean;
    severity: BannedWordSeverity;
  }) {
    const created = await createBannedWord(payload);
    await moderationService.rebuildMatcher();
    return created;
  }

  async updateWord(
    id: string,
    payload: {
      word?: string;
      strictMode?: boolean;
      severity?: BannedWordSeverity;
    }
  ) {
    const updated = await updateBannedWord(id, payload);
    if (!updated) {
      throw HttpError.notFound("Banned word not found", {
        code: "BANNED_WORD_NOT_FOUND",
        meta: { source: "WordsModerationService.updateWord" },
      });
    }

    await moderationService.rebuildMatcher();
    return updated;
  }

  async deleteWord(id: string) {
    const deleted = await deleteBannedWord(id);
    if (!deleted) {
      throw HttpError.notFound("Banned word not found", {
        code: "BANNED_WORD_NOT_FOUND",
        meta: { source: "WordsModerationService.deleteWord" },
      });
    }

    await moderationService.rebuildMatcher();
    return deleted;
  }
}

export default new WordsModerationService();
