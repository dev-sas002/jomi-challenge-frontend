import { safeHref } from "../safeHref";

describe("safeHref", () => {
  it.each([
    ["https://example.com/page", "https://example.com/page"],
    ["http://example.com", "http://example.com"],
    ["mailto:team@example.com", "mailto:team@example.com"],
    ["tel:+15551234567", "tel:+15551234567"],
    ["/relative/path", "/relative/path"],
    ["relative/path", "relative/path"],
    ["#anchor", "#anchor"],
    ["  https://example.com/padded  ", "https://example.com/padded"],
  ])("allows %s", (input, expected) => {
    expect(safeHref(input)).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("rejects the unsafe scheme in %s", (input) => {
    expect(safeHref(input)).toBeNull();
  });

  it.each([null, undefined, "", "   "])(
    "returns null for the empty value %p",
    (input) => {
      expect(safeHref(input as string | null | undefined)).toBeNull();
    }
  );

  it("rejects non-string input defensively", () => {
    expect(safeHref(42 as unknown as string)).toBeNull();
    expect(safeHref({} as unknown as string)).toBeNull();
  });

  it("strips control characters before deciding, so obfuscated schemes are caught", () => {
    // Browsers ignore embedded tabs/newlines in URLs, so `java\nscript:` still
    // executes. The URL parser normalises it the same way.
    expect(safeHref("java\nscript:alert(1)")).toBeNull();
    expect(safeHref("java\tscript:alert(1)")).toBeNull();
  });
});
