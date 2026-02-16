import path from "path";
import { fileURLToPath } from "node:url";

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory is at backend/uploads (go up from config folder to src, then to backend)
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

console.log("📁 Uploads directory configured at:", uploadsDir);
