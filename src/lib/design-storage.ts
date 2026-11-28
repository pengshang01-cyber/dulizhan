import { CUP, type Design } from "./blank-design";
import { DesignFileError, type Files } from "./design-files";
import { getItems } from "./inquiry";
interface Draft {
  design: Design;
  logo?: File;
  production?: File;
}
type Stored = { draft: Draft; quote: { id: string; files: Files } };
async function record<K extends keyof Stored>(
  key: K,
  action: "read" | "write" | "release",
  value?: Stored[K],
  releaseId?: string,
): Promise<Stored[K] | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("cup-print-studio", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("5039");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(
          "5039",
          action === "read" ? "readonly" : "readwrite",
        ),
        store = tx.objectStore("5039");
      const req = action === "write" ? store.put(value, key) : store.get(key);
      if (action === "release")
        req.onsuccess = () => {
          if (req.result?.id === releaseId) store.delete(key);
        };
      tx.oncomplete = () => resolve(action === "read" ? req.result : undefined);
      tx.onabort = tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export const loadDraft = () => record("draft", "read");
export const saveDraft = (d: Draft) => record("draft", "write", d);
export const saveQuote = (id: string, files: Files) =>
  record("quote", "write", { id, files });
export async function inquiryBody(
  payload: unknown,
  id: string,
): Promise<FormData> {
  const saved = await record("quote", "read").catch(() => undefined);
  if (
    !saved ||
    saved.id !== id ||
    !getItems().some((i) => i.slug === CUP && i.designId === id)
  )
    throw new DesignFileError("missing_design");
  const form = new FormData();
  form.set("payload", JSON.stringify(payload));
  for (const [role, f] of Object.entries(saved.files))
    form.set(role, f, f.name);
  return form;
}
export async function releaseQuote(id: string) {
  await record("quote", "release", undefined, id);
}
