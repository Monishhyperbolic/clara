"use client";

export async function extractPdfText(file: File): Promise<string> {
  // Dynamically load pdf.js only in browser
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[]).map((item: any) => item.str || "").join(" ");
    texts.push(pageText);
  }

  return texts.join("\n\n").trim();
}
