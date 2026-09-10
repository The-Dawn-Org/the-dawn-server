import { Controller, Get, Header, Query, Res } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import type { Response } from "express";
import { readFileSync } from "node:fs";
import puppeteer from "puppeteer";
import { MockData } from "./statistics.repository.js";
import { StatisticsService } from "./statistics.service.js";

export function getLogoDataUri(): string {
  const logoPath = new URL("../../../public/hashaharLogo.jpeg", import.meta.url);
  const imageBuffer = readFileSync(logoPath);

  return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
}

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

      // Get dates from query parameters first.
      let startDate = startDateQuery ?? "";
      let endDate = endDateQuery ?? "";

      // If they were not passed separately, try to get them from the path.
      try {
        const pageUrl = new URL(path);

        if (!startDate) {
          startDate = pageUrl.searchParams.get("startDate") ?? "";
        }

        if (!endDate) {
          endDate = pageUrl.searchParams.get("endDate") ?? "";
        }
      } catch {
        // Keep the query parameter values.
      }

      // Remove PDF-only parameters from the URL Puppeteer opens.
      let pagePath = path;

      try {
        const pageUrl = new URL(path);

        pageUrl.searchParams.delete("startDate");
        pageUrl.searchParams.delete("endDate");

        pagePath = pageUrl.toString();
      } catch {
        // Keep original path.
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

      const logoDataUri = getLogoDataUri();

      await page.evaluate(
        ({ startDate, endDate, logoDataUri }) => {
          /*
           * Format the date WITHOUT converting it to a JavaScript Date.
           *
           * The client sends:
           * YYYY-MM-DDTHH:mm
           *
           * We simply display that exact date and time.
           */
          const formatDate = (value: string) => {
            if (!value) {
              return "";
            }

            const [datePart, timePart] = value.split("T");

            if (!datePart) {
              return value;
            }

            const [year, month, day] = datePart.split("-");

            if (!year || !month || !day) {
              return value;
            }

            return `${day}/${month}/${year}${timePart ? ` ${timePart}` : ""}`;
          };

          const dateRangeText =
            startDate && endDate
              ? `טווח תאריכים: ${formatDate(startDate)} - ${formatDate(endDate)}`
              : startDate
                ? `מתאריך: ${formatDate(startDate)}`
                : endDate
                  ? `עד תאריך: ${formatDate(endDate)}`
                  : "";

          /*
           * INVERT PAGE FOR PDF
           */
          document.body.style.filter = "invert(1)";

          /*
           * PDF HEADER
           */
          const header = document.createElement("div");

          header.style.cssText = `
            position: relative;
            width: 100%;
            min-height: 180px;
            margin-bottom: 30px;
            padding: 10px 220px 20px 220px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            direction: rtl;
          `;

          /*
           * Current date
           */
          const currentDate = document.createElement("div");

          currentDate.style.cssText = `
            position: absolute;
            top: 15px;
            left: 15px;
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

          /*
           * Report title
           */
          const title = document.createElement("h1");

          title.style.cssText = `
            margin: 0;
            text-align: center;
            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;
          `;

          title.textContent = "דו״ח חקירה";

          /*
           * Right-side logo
           */
          const logo = document.createElement("img");
          logo.src = logoDataUri;
          logo.alt = "Logo";
          logo.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: auto;
            object-fit: contain;
            display: block;
            z-index: 2;
            filter: none;
            background: transparent;
          `;

          /*
           * Selected date range
           */
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
          header.appendChild(logo);
          header.appendChild(title);

          if (dateRangeText) {
            header.appendChild(dateRange);
          }

          document.body.prepend(header);

          /*
           * HIDE NAVBAR
           */
          document
            .querySelectorAll<HTMLElement>(".navbar")
            .forEach((element) => {
              element.style.display = "none";
            });

          /*
           * REMOVE SCROLLING
           */
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

          /*
           * HIDE EXPORT BUTTON
           */
          document
            .querySelectorAll<HTMLElement>(".export-to-pdf-button")
            .forEach((element) => {
              element.style.display = "none";
            });

          /*
           * SUMMARY
           */
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
        },
        {
          startDate,
          endDate,
          logoDataUri,
        },
      );

      /*
       * GENERATE PDF
       */
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