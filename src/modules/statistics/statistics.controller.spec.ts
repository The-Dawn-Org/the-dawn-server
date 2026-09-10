import { describe, expect, it } from "vitest";
import { getLogoDataUri } from "./statistics.controller.js";

describe("getLogoDataUri", () => {
  it("returns a real embedded logo data URL for the PDF header", () => {
    const logoDataUri = getLogoDataUri();

    expect(logoDataUri).toMatch(/^data:image\/(jpeg|png);base64,/i);
    expect(logoDataUri.length).toBeGreaterThan(200);
  });
});
