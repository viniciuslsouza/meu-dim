"use client";

import {
  GlobalWorkerOptions,
  getDocument
} from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PositionedText {
  str: string;
  transform: number[];
}

function isPositionedText(value: unknown): value is PositionedText {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PositionedText>;

  return (
    typeof candidate.str === "string" &&
    Array.isArray(candidate.transform)
  );
}

function rebuildLines(items: unknown[]): string {
  const lines: { y: number; items: { x: number; text: string }[] }[] = [];

  for (const item of items) {
    if (!isPositionedText(item) || !item.str.trim()) {
      continue;
    }

    const x = item.transform[4] ?? 0;
    const y = item.transform[5] ?? 0;
    let line = lines.find((candidate) => Math.abs(candidate.y - y) < 2);

    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }

    line.items.push({ x, text: item.str.trim() });
  }

  return lines
    .sort((left, right) => right.y - left.y)
    .map((line) =>
      line.items
        .sort((left, right) => left.x - right.x)
        .map(({ text }) => text)
        .join(" ")
    )
    .join("\n");
}

export async function extractPdfText(file: File): Promise<string[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data });

  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();

      pages.push(rebuildLines(content.items));
      page.cleanup();
    }

    return pages;
  } finally {
    await loadingTask.destroy();
  }
}
