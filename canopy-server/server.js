/**
 * Canopy dashboard backend
 * ------------------------
 * A small local server that stores the dashboard's weekly stats history
 * and uploaded media on disk, so data survives restarts and is shared
 * across browser sessions / devices on the same network.
 *
 * Data is stored in data.json (per-platform stats + history).
 * Uploaded media files are stored in /uploads and served statically.
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const DATA_FILE = path.join(__dirname, "data.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const VALID_PLATFORMS = ["facebook", "instagram", "linkedin", "youtube", "pinterest"];
const NUMERIC_FIELDS = ["followers", "reach", "likes", "views", "followerViews", "nonFollowerViews"];

/* ---------------------------------------------------------------- */
/* Storage helpers                                                    */
/* ---------------------------------------------------------------- */

function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function isValidPlatform(key) {
  return VALID_PLATFORMS.includes(key);
}

/* ---------------------------------------------------------------- */
/* Routes                                                             */
/* ---------------------------------------------------------------- */

// Get the full dashboard state
app.get("/api/data", (req, res) => {
  try {
    res.json(readData());
  } catch (err) {
    res.status(500).json({ error: "Could not read dashboard data" });
  }
});

// Update a platform's weekly stats.
// Appends a new entry to the follower history (one entry per save = one week).
app.put("/api/platforms/:key/stats", (req, res) => {
  const { key } = req.params;
  if (!isValidPlatform(key)) {
    return res.status(404).json({ error: "Unknown platform" });
  }

  const body = req.body || {};
  for (const field of NUMERIC_FIELDS) {
    if (typeof body[field] !== "number" || Number.isNaN(body[field]) || body[field] < 0) {
      return res.status(400).json({ error: `Field "${field}" must be a non-negative number` });
    }
  }

  const data = readData();
  const platform = data[key];

  const nextWeek = `W${platform.history.length + 1}`;
  platform.followers        = body.followers;
  platform.reach            = body.reach;
  platform.likes            = body.likes;
  platform.views            = body.views;
  platform.followerViews    = body.followerViews;
  platform.nonFollowerViews = body.nonFollowerViews;
  platform.history = [...platform.history, { week: nextWeek, followers: body.followers }];

  writeData(data);
  res.json(platform);
});

// Upload an image or video for a platform's weekly content section
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

app.post("/api/platforms/:key/media", upload.single("file"), (req, res) => {
  const { key } = req.params;
  if (!isValidPlatform(key)) {
    return res.status(404).json({ error: "Unknown platform" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const data = readData();
  const isVideo = req.file.mimetype.startsWith("video/");

  const mediaItem = {
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: isVideo ? "video" : "image",
  url: `/uploads/${req.file.filename}`,
  name: req.file.originalname,
  filename: req.file.filename,
  uploadedAt: new Date().toISOString(),
  week: req.body.week || null,
};

  data[key].media.push(mediaItem);
  writeData(data);
  res.json(mediaItem);
});

// Delete an uploaded media item
app.delete("/api/platforms/:key/media/:id", (req, res) => {
  const { key, id } = req.params;
  if (!isValidPlatform(key)) {
    return res.status(404).json({ error: "Unknown platform" });
  }

  const data = readData();
  const item = data[key].media.find((m) => m.id === id);

  if (item) {
    const filePath = path.join(UPLOADS_DIR, item.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  data[key].media = data[key].media.filter((m) => m.id !== id);
  writeData(data);
  res.json({ success: true });
});

// Error handler (e.g. multer file-type/size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Canopy server running at http://localhost:${PORT}`);
});
