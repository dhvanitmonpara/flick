import { Request, Response, NextFunction } from "express";
import stringSimilarity from "string-similarity";
import { ApiError } from "../utils/ApiHelpers";
import { createWorker } from "tesseract.js";

let worker: any = null;

async function initWorker() {
  worker = await createWorker("eng");
}

const extractEmail = (text: string) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0].toLowerCase() : null;
};

const BRANCHES = ["BCA", "BTECH", "MBA", "MCA", "MSC", "BBA"];

const removeSpacesInWords = (text: string) => {
  return text.replace(/\b(\w+)\b/g, (word) => word.replace(/\s+/g, ""));
};

const extractBranch = (text: string) => {
  const normalized = text.toUpperCase().replace(/\s+/g, "");
  let bestMatch: { rating: number; target: string | null } = {
    rating: 0,
    target: null,
  };

  for (const branch of BRANCHES) {
    const rating = stringSimilarity.compareTwoStrings(normalized, branch);
    if (rating > bestMatch.rating) {
      bestMatch = { rating, target: branch };
    }
  }

  return bestMatch.rating > 0.7 ? bestMatch.target : null; // threshold tuneable
};

const extractStudentDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    if (!file) throw new ApiError(400, "No file found");
    const ret = await worker.recognize(file.path);

    const email = extractEmail(ret.data.text);
    const branch = extractBranch(ret.data.text);

    res.status(200).json({
      success: true,
      data: { email, branch },
    });
  } catch (error) {
    console.log(error);
  }
};

export { extractStudentDetails, initWorker };
