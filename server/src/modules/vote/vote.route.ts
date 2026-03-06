import { Router } from "express";
import VoteController from "./vote.controller";
import { withRequiredUserContext } from "@/core/middlewares/pipelines";

const router = Router();

router.use(withRequiredUserContext);

router
  .route("/")
  // .post(blockSuspensionMiddleware, VoteController.createVote)
  .post(VoteController.createVote)
  .delete(VoteController.deleteVote)
  // .patch(blockSuspensionMiddleware, VoteController.patchVote);
  .patch(VoteController.patchVote);

export default router;
