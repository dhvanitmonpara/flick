import { Router } from "express";
import { extractStudentDetails } from "../controllers/extract.controller";

const router = Router()

router.route('/').post(extractStudentDetails)

export default router;