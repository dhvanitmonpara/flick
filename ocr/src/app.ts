import express from "express";
import cors from "cors";
import multer from "multer";
import "./conf/cors"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const app = express();
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.options("*", cors());
app.use("/uploads", express.static("uploads"));

import extractRoutes from "./routes/extract.route";

// routes
app.use("/api/v1/extract", upload.single("studentId"), extractRoutes);

export default app;
