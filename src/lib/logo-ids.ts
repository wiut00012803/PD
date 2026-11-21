let counter = 0;

export function nextLogoId(): string {
  counter += 1;
  return `l${counter}`;
}
