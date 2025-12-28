import { ApiError } from "@/core/http";
import * as feedbackRepo from "./feedback.repo";

class FeedbackService {
  async createFeedback(feedbackData: {
    title: string;
    content: string;
    type: "feedback" | "bug" | "feature" | "other";
    userId: string;
  }) {
    const newFeedback = await feedbackRepo.create({
      title: feedbackData.title.trim(),
      content: feedbackData.content.trim(),
      type: feedbackData.type,
      userId: feedbackData.userId,
      status: "new", // Default status for new feedback
    });

    return newFeedback;
  }

  async getFeedbackById(id: string, includeUser = false) {
    const feedback = includeUser 
      ? await feedbackRepo.findByIdWithUser(id)
      : await feedbackRepo.findById(id);
      
    if (!feedback) {
      throw new ApiError({
        statusCode: 404,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
        data: { service: "FeedbackService.getFeedbackById" },
        errors: [{ field: "id", message: "Feedback not found" }],
      });
    }
    
    return feedback;
  }

  async listFeedbacks(options?: {
    limit?: number;
    skip?: number;
    type?: "feedback" | "bug" | "feature" | "other";
    status?: "new" | "reviewed" | "dismissed";
  }) {
    const feedbacks = await feedbackRepo.findAll(options);
    const totalCount = await feedbackRepo.countAll({
      type: options?.type,
      status: options?.status,
    });

    const limit = options?.limit || 50;
    const skip = options?.skip || 0;

    return {
      feedbacks,
      meta: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + feedbacks.length < totalCount,
      },
    };
  }

  async updateFeedbackStatus(
    id: string,
    status: "new" | "reviewed" | "dismissed"
  ) {
    // Check if feedback exists
    const existing = await feedbackRepo.findById(id);
    if (!existing) {
      throw new ApiError({
        statusCode: 404,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
        data: { service: "FeedbackService.updateFeedbackStatus" },
        errors: [{ field: "id", message: "Feedback not found" }],
      });
    }

    const updatedFeedback = await feedbackRepo.updateById(id, { status });
    return updatedFeedback;
  }

  async deleteFeedback(id: string) {
    const existing = await feedbackRepo.findById(id);
    if (!existing) {
      throw new ApiError({
        statusCode: 404,
        message: "Feedback not found",
        code: "FEEDBACK_NOT_FOUND",
        data: { service: "FeedbackService.deleteFeedback" },
        errors: [{ field: "id", message: "Feedback not found" }],
      });
    }

    const deletedFeedback = await feedbackRepo.deleteById(id);
    return deletedFeedback;
  }

  async getFeedbacksByUser(userId: string, options?: {
    limit?: number;
    skip?: number;
  }) {
    // This would require a new adapter method, but keeping it simple for now
    // Could be implemented later if needed
    throw new ApiError({
      statusCode: 501,
      message: "Get feedbacks by user not implemented yet",
      code: "NOT_IMPLEMENTED",
      data: { service: "FeedbackService.getFeedbacksByUser" },
      errors: [],
    });
  }
}

export default new FeedbackService();