import type { Request } from "express";
import { Controller, HttpResponse } from "@/core/http";
import wordsModerationService from "./words-moderation.service";
import {
  moderationWordIdSchema,
  moderationWordSchema,
  moderationWordUpdateSchema,
} from "./words-moderation.schema";

@Controller()
class WordsModerationController {
  static async getConfig(_req: Request) {
    const config = await wordsModerationService.getConfig();
    return HttpResponse.ok("Moderation config fetched", config);
  }

  static async listWords(_req: Request) {
    const words = await wordsModerationService.listWords();
    return HttpResponse.ok("Banned words fetched", { words });
  }

  static async createWord(req: Request) {
    const payload = moderationWordSchema.parse(req.body);
    const word = await wordsModerationService.createWord(payload);

    return HttpResponse.created("Banned word created", { word });
  }

  static async updateWord(req: Request) {
    const { id } = moderationWordIdSchema.parse(req.params);
    const payload = moderationWordUpdateSchema.parse(req.body);
    const word = await wordsModerationService.updateWord(id, payload);

    return HttpResponse.ok("Banned word updated", { word });
  }

  static async deleteWord(req: Request) {
    const { id } = moderationWordIdSchema.parse(req.params);
    const word = await wordsModerationService.deleteWord(id);

    return HttpResponse.ok("Banned word deleted", { word });
  }
}

export default WordsModerationController;
