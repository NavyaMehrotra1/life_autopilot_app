/** Tiny color helpers for interpolating fills (matcha cup, freshness bars). */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** Linear blend between two hex colors. t in [0,1]. */
export function lerpColor(a: string, b: string, t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `#${toHex(r1 + (r2 - r1) * x)}${toHex(g1 + (g2 - g1) * x)}${toHex(b1 + (b2 - b1) * x)}`;
}
