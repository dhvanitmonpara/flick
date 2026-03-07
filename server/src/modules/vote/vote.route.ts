import { Router } from "express";
import { withRequiredUserContext } from "@/core/middlewares/pipelines";
import VoteController from "./vote.controller";

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
