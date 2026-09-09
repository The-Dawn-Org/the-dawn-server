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

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
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