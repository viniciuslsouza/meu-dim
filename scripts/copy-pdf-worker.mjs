import { access, copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(
  new URL(
    "../apps/web/node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  )
);
const publicDirectory = fileURLToPath(
  new URL("../apps/web/public/", import.meta.url)
);
const destination = fileURLToPath(
  new URL("../apps/web/public/pdf.worker.min.mjs", import.meta.url)
);

try {
  await access(source);
} catch {
  process.exit(0);
}

await mkdir(publicDirectory, { recursive: true });
await copyFile(source, destination);
