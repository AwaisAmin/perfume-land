import { touchUpdatedAt } from "../repositories/settingsRepo.js";
import { triggerRevalidate } from "./revalidate.js";

// Call after every successful admin write: bump settings.updatedAt so the
// public payload's updatedAt changes, then ask the website to refresh its
// cache. Never throws.
export async function afterWrite() {
  try {
    await touchUpdatedAt();
  } catch (err) {
    console.error("Failed to update settings.updatedAt:", err.message);
  }
  await triggerRevalidate();
}
