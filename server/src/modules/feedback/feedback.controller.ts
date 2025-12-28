import { Request } from "express";
import ApiResponse from "@/core/http/ApiResponse.js";
import { AsyncHandler } from "@/core/http/asyncHandler.js";
import feedbackService from "./feedback.service";

class FeedbackController {

  @AsyncHandler()
  async createFeedback(req: Request) {
    const { title, content, type } = req.body;
    const userId = req.user.id;

    const newFeedback = await feedbackService.createFeedback({
      title,
      content,
      type,
      userId,
    });

    return ApiResponse.created({
      message: "Feedback created successfully",
      feedback: newFeedback,
    });
  }

  @AsyncHandler()
  async getFeedbackById(req: Request) {
    const { id } = req.params;

    const feedback = await feedbackService.getFeedbackById(id, true);

    return ApiResponse.ok({
      feedback,
    });
  }

  @AsyncHandler()
  async listFeedbacks(req: Request) {
    const { limit, skip, type, status } = req.query as {
      limit?: number;
      skip?: number;
      type?: "feedback" | "bug" | "feature" | "other";
      status?: "new" | "reviewed" | "dismissed";
    };

    const result = await feedbackService.listFeedbacks({
      limit,
      skip,
      type,
      status,
    });

    return ApiResponse.ok(result);
  }

  @AsyncHandler()
  async updateFeedbackStatus(req: Request) {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await feedbackService.updateFeedbackStatus(id, status);

    return ApiResponse.ok({
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  }

  @AsyncHandler()
  async deleteFeedback(req: Request) {
    const { id } = req.params;

    await feedbackService.deleteFeedback(id);

    return ApiResponse.ok({
      message: "Feedback deleted successfully",
    });
  }
}

export default new FeedbackController();
