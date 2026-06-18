import { apiGet } from "./client";
import type { Category } from "./types";

export function listCategories() {
  return apiGet<Category[]>("/api/v2/categories");
}
