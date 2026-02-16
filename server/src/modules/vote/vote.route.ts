import { Router } from "express";
import VoteController from "./vote.controller";
// import { authenticate, blockSuspensionMiddleware } from "@/core/middlewares";
import { authenticate } from "@/core/middlewares";

const router = Router();

router.use(authenticate);

router
  .route("/")
  // .post(blockSuspensionMiddleware, VoteController.createVote)
  .post(VoteController.createVote)
  .delete(VoteController.deleteVote)
  // .patch(blockSuspensionMiddleware, VoteController.patchVote);
  .patch(VoteController.patchVote);

export default router;
