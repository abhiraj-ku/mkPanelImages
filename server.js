require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

// Rate limiting: 5 download requests per minute per IP
const downloadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many download requests, please try again after a minute.",
});

// // API key validation middleware
// const apiKeyMiddleware = (req, res, next) => {
//   const apiKey = req.headers["x-api-key"];
//   if (!apiKey || apiKey !== process.env.API_KEY) {
//     return res.status(403).json({ error: "Forbidden: Invalid API Key" });
//   }
//   next();
// };

// API URL for image data
const apiUrl = `https://storage.googleapis.com/panels-api/data/20240916/media-1a-i-p~s`;

// Helper function to paginate images
const paginate = (array, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return array.slice(start, start + pageSize);
};

// API to get images with pagination
app.get("/api/images", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 15;

  try {
    const response = await axios.get(apiUrl);
    const imagesData = response.data.data;
    const images = Object.values(imagesData).map((img) => ({
      url: img.dsd || img.dhd,
      alt: "Image",
    }));

    const paginatedImages = paginate(images, page, pageSize);

    res.json({ images: paginatedImages, totalImages: images.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.get("/api/download", downloadLimiter, (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: "Image url missing" });
  }

  const fileName = path.basename(imageUrl.split("?")[0]); // Extract the filename from the URL
  console.log(fileName);

  axios({
    url: imageUrl,
    method: "GET",
    responseType: "stream",
  })
    .then((response) => {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      response.data.pipe(res);
    })
    .catch((err) => {
      res.status(500).json({ error: "Failed to download image" });
    });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log(`SIGTERM signal received, closing the server`);

  server.close(() => {
    console.log(`Closed the HTTP server gracefully.`);
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log(`SIGINT signal received, closing the server`);

  server.close(() => {
    console.log(`Closed the HTTP server gracefully.`);
    process.exit(0);
  });
});
