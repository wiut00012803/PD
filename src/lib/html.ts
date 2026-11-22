const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\u003c");
}

export function externalLink(external: boolean): Record<string, string> {
  return external ? { target: "_blank", rel: "noopener" } : {};
}
