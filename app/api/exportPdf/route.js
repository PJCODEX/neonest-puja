import puppeteer from "puppeteer";

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response("Missing URL", { status: 400 });
    }

    // Detect environment: local dev vs Vercel
    const isVercel = !!process.env.VERCEL;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: isVercel
        ? "/usr/bin/google-chrome" // Vercel path
        : puppeteer.executablePath(), // Local installed Chromium
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=neonest-data.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
