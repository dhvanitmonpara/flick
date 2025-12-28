import { Router } from "express";
import collegeController from "./college.controller";
import { adminOnly, rateLimitMiddleware } from "@/core/middlewares";
import { validate } from "@/core/middlewares";
import * as collegeSchemas from "./college.schema";

const router = Router();

router.use(rateLimitMiddleware.apiRateLimiter);

router
  .route("/")
  .post(
    adminOnly,
    validate(collegeSchemas.createCollegeSchema),
    collegeController.createCollege
  );

router
  .route("/")
  .get(
    validate(collegeSchemas.collegeFiltersSchema, "query"),
    collegeController.getColleges
  );

router
  .route("/:id")
  .get(
    validate(collegeSchemas.collegeIdSchema, "params"),
    collegeController.getCollegeById
  );

router
  .route("/:id")
  .patch(
    adminOnly,
    validate(collegeSchemas.collegeIdSchema, "params"),
    validate(collegeSchemas.updateCollegeSchema),
    collegeController.updateCollege
  );

router
  .route("/:id")
  .delete(
    adminOnly,
    validate(collegeSchemas.collegeIdSchema, "params"),
    collegeController.deleteCollege
  );

export default router;