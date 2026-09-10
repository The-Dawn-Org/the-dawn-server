import { Controller, Get, Header, Res } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { Response } from "express";
import puppeteer from "puppeteer";
import { MockData } from "./statistics.repository.js";
import { StatisticsService } from "./statistics.service.js";

@Controller()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: "Get mock data" })
  getHello(): MockData[] {
    return this.statisticsService.getHello();
  }

  @Get("report/pdf")
  @Header("Content-Type", "application/pdf")
  @Header("Content-Disposition", 'attachment; filename="report.pdf"')
  @ApiOperation({
    summary: "Generate PDF from the investigation map page",
  })
  async generatePdf(@Res() res: Response): Promise<void> {
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.goto("http://localhost:5173/investigation-map", {
        waitUntil: "networkidle0",
        timeout: 120000,
      });
      

      await page.evaluate(() => {
        document.body.style.filter = "invert(1)";

        const Pagetitle = `דו"ח חקירה - ${document.title}`;

        const header = document.createElement("div");

        header.innerHTML = `
          <div style="
            text-align: center;
            margin-bottom: 30px;
            font-family: Arial, sans-serif;
          ">
            <h1 style="
              margin: 0;
              font-size: 32px;
              font-weight: 700;
            ">
              ${Pagetitle}
            </h1>

            <div style="
              margin-top: 6px;
              left: 0;
              font-size: 13px;
              color: #666;
            ">
              תאריך: ${new Date().toLocaleString("he-IL", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
          </div>
        `;

        document.body.prepend(header);

        document
          .querySelectorAll<HTMLElement>(".navbar")
          .forEach((element) => {
            element.style.display = "none";
          });

        const elements = document.querySelectorAll<HTMLElement>("*");

        elements.forEach((element) => {
          const hasVerticalOverflow =
            element.scrollHeight > element.clientHeight;

          const hasHorizontalOverflow =
            element.scrollWidth > element.clientWidth;

          if (hasVerticalOverflow || hasHorizontalOverflow) {
            element.style.overflow = "visible";
            element.style.height = "auto";
            element.style.maxHeight = "none";
            element.style.width = "auto";
            element.style.maxWidth = "none";
          }
        });

        const summary = document.createElement("div");

        summary.innerHTML = `
          <div style="
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-family: Arial, sans-serif;
          ">
            <h2 style="
              margin: 0 0 10px 0;
              font-size: 20px;
            ">
              סיכום
            </h2>

            <p style="
              margin: 0;
              font-size: 14px;
              line-height: 1.6;
            ">
              רעי ףש'קח שךרעו דגנ בלידנג שדגךצמ בדקריףםשגכ ךשקי
            </p>
          </div>
        `;

        document.body.appendChild(summary);
      });

      const pdfBuffer = await page.pdf({
        width: 1500,
        printBackground: true,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="report.pdf"',
      );

      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Failed to generate PDF:", error);

      res.status(500).json({
        message: "Failed to generate PDF",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}