import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import recommendationsController from "./controllers/getMovies.js";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Express route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Express route to handle movie recommendation requests
app.get("/recommendations", recommendationsController);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
