import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Main Server running on http://localhost:${PORT}`);
});
