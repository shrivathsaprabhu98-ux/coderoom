import { config } from "dotenv";
import { fileURLToPath } from "node:url";

// Load the .env file from the main coderoom folder (three levels up from this file)
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });