import { describe, expect, it } from "vitest";
import { classifySource, isBot, lastDays, summarizeStats, type StatRow } from "./stats";

describe("sources de trafic", () => {
  it("reconnaît les moteurs, réseaux et assistants IA", () => {
    expect(classifySource("https://www.google.fr/", "site.fr")).toBe("Google");
    expect(classifySource("https://chatgpt.com/c/abc", "site.fr")).toBe("ChatGPT");
    expect(classifySource("https://gemini.google.com/app", "site.fr")).toBe("Gemini");
    expect(classifySource("https://m.facebook.com/", "site.fr")).toBe("Facebook");
    expect(classifySource("", "site.fr")).toBe("Direct");
    expect(classifySource("https://blog.exemple.org/x", "site.fr")).toBe("blog.exemple.org");
  });
  it("ignore la navigation interne", () => {
    expect(
      classifySource("http://plomberie.localhost:3000/contact", "plomberie.localhost:3000"),
    ).toBeNull();
  });
});

describe("synthèse", () => {
  it("agrège par type, jour, page et source, sur la période seulement", () => {
    const days = ["2026-10-01", "2026-10-02"];
    const rows: StatRow[] = [
      { day: "2026-10-01", kind: "visit", key: "Google", count: 3 },
      { day: "2026-10-02", kind: "visit", key: "Direct", count: 1 },
      { day: "2026-10-02", kind: "pageview", key: "/", count: 5 },
      { day: "2026-10-02", kind: "pageview", key: "/contact", count: 2 },
      { day: "2026-10-02", kind: "call", key: "", count: 1 },
      { day: "2026-09-01", kind: "visit", key: "Google", count: 99 },
    ];
    const s = summarizeStats(rows, days);
    expect(s.totals).toEqual({ pageview: 7, visit: 4, call: 1, email: 0 });
    expect(s.daily).toEqual([
      { day: "2026-10-01", visits: 3 },
      { day: "2026-10-02", visits: 1 },
    ]);
    expect(s.topPages[0]).toEqual({ key: "/", count: 5 });
    expect(s.topSources[0]).toEqual({ key: "Google", count: 3 });
  });
  it("produit des jours consécutifs", () => {
    const d = lastDays(3, new Date("2026-10-14T12:00:00Z"));
    expect(d).toEqual(["2026-10-12", "2026-10-13", "2026-10-14"]);
  });
  it("écarte les robots", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130")).toBe(false);
  });
});
