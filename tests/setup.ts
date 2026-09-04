// Load .env / .env.local so DATABASE_URL (used by the numbering concurrency
// test) is available without exporting it by hand.
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });
