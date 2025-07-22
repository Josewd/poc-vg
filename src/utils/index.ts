export function escapeText(text: string): string {
  return text
    .replace(/'/g, "`")  // Escape single quotes
    .replace(/:/g, "")  // Escape colons
    .replace(/=/g, "")  // Escape equals
    .replace(/\[/g, "") // Escape brackets
    .replace(/\]/g, "") // Escape brackets
    .replace(/\(/g, "") // Escape parentheses
    .replace(/\)/g, "") // Escape parentheses
    .replace(/,/g, "")  // Escape commas
    .replace(/;/g, "")  // Escape semicolons
    .replace(/\n/g, "") // Escape line breaks
    .replace(/\r/g, ""); // Escape carriage returns
}