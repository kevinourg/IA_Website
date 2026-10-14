import { describe, expect, it } from "vitest";
import { escapeHtml, newContactEmail } from "./email-templates";

describe("e-mails", () => {
  it("échappe le contenu des messages de visiteurs", () => {
    const mail = newContactEmail({
      to: "client@exemple.fr",
      businessName: "Plomberie Martin",
      name: "<script>alert(1)</script>",
      contact: "0600000000",
      message: '<img src=x onerror="vol()">',
      espaceUrl: "https://exemple.fr/espace/abc",
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.text).toContain("https://exemple.fr/espace/abc");
  });
  it("escapeHtml couvre les guillemets", () => {
    expect(escapeHtml(`"'&`)).toBe("&quot;&#39;&amp;");
  });
});
