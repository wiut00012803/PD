export function initials(name: string): string {
  const words = name.replace(/[«»"]/g, "").split(/\s+/).filter((w) => /^\p{L}/u.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
