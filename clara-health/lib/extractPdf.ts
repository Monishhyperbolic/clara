"use client";

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  // Use local worker served from /public — no CDN, no 404
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map((item: any) => item.str || "")
      .join(" ");
    if (pageText.trim()) texts.push(pageText);
  }

  return texts.join("\n\n").trim();
}
