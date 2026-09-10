import { Controller, Get, Header, Query, Res } from "@nestjs/common";
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
    summary: "Generate PDF from the requested page",
  })
  async generatePdf(
    @Query("path") path: string,
    @Query("startDate") startDateQuery: string,
    @Query("endDate") endDateQuery: string,
    @Res() res: Response,
  ): Promise<void> {
    let browser;

    try {
      if (!path) {
        res.status(400).json({
          message: "Path is required",
        });
        return;
      }

    
      let startDate = startDateQuery;
      let endDate = endDateQuery;

      try {
        const pageUrl = new URL(path);

        if (!startDate) {
          startDate = pageUrl.searchParams.get("startDate") ?? "";
        }

        if (!endDate) {
          endDate = pageUrl.searchParams.get("endDate") ?? "";
        }
      } catch {
      
      }

      

      let pagePath = path;

      try {
        const pageUrl = new URL(path);

        pageUrl.searchParams.delete("startDate");
        pageUrl.searchParams.delete("endDate");

        pagePath = pageUrl.toString();
      } catch {
       
      }

      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.goto(pagePath, {
        waitUntil: "networkidle0",
        timeout: 120000,
      });

      await page.evaluate(
        ({ startDate, endDate }) => {
        

          const formatDate = (value: string) => {
            if (!value) {
              return "";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
              return value;
            }

            return date.toLocaleString("he-IL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hourCycle: "h23",
              timeZone: "Asia/Jerusalem",
            });
          };

          const dateRangeText =
            startDate && endDate
              ? `טווח תאריכים: ${formatDate(startDate)} - ${formatDate(endDate)}`
              : startDate
                ? `מתאריך: ${formatDate(startDate)}`
                : endDate
                  ? `עד תאריך: ${formatDate(endDate)}`
                  : "";

        

          document.body.style.filter = "invert(1)";

          const header = document.createElement("div");

          header.style.cssText = `
            position: relative;
            width: 100%;
            margin-bottom: 30px;
            padding-bottom: 20px;
            font-family: Arial, sans-serif;
            direction: rtl;
          `;

          const currentDate = document.createElement("div");

          currentDate.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            font-size: 13px;
            color: #666;
            text-align: left;
            direction: rtl;
          `;

          currentDate.textContent = `הופק בתאריך: ${new Date().toLocaleString(
            "he-IL",
            {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Asia/Jerusalem",
            },
          )}`;

          const title = document.createElement("h1");

          title.style.cssText = `
            margin: 0;
            text-align: center;
            font-size: 32px;
            font-weight: 700;
          `;

          title.textContent = "דו״ח חקירה";

          const dateRange = document.createElement("div");

          dateRange.style.cssText = `
            margin-top: 8px;
            text-align: center;
            font-size: 14px;
            color: #666;
            direction: rtl;
          `;

          if (dateRangeText) {
            dateRange.textContent = dateRangeText;
          }

          header.appendChild(currentDate);
          header.appendChild(title);

          if (dateRangeText) {
            header.appendChild(dateRange);
          }

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

          document
            .querySelectorAll<HTMLElement>(".export-to-pdf-button")
            .forEach((element) => {
              element.style.display = "none";
            });

          const summary = document.createElement("div");

          summary.innerHTML = `
            <div style="
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              font-family: Arial, sans-serif;
              direction: rtl;
            ">
              <h2 style="
                margin: 0 0 10px 0;
                font-size: 20px;
              ">
                  סיכום בעזרת AI
              </h2>

              <p style="
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
              ">
                כאן יהיה סיכום בעזרת AI של הנתונים שהוצגו בדו״ח.
              </p>
            </div>
          `;

          document.body.appendChild(summary);
        },
        {
          startDate: startDate ?? "",
          endDate: endDate ?? "",
        },
      );

      const pdfBuffer = await page.pdf({
        width: "1500px",
        printBackground: true,
        preferCSSPageSize: false,
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