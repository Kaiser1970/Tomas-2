/**
 * Avatares generados localmente (SVG en data URI) para funcionar sin internet.
 */

const COLORS = ['#C9713D', '#B08D57', '#8A9A5B', '#5B7C8D', '#A65D57', '#6B4F35'];

const toDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] || '';
  const second = parts.length > 1 ? parts[1][0] : '';
  return (first + second).toUpperCase();
}

/** Avatar con las iniciales del paciente. */
export function avatarFromName(name: string): string {
  const color = colorFor(name || '?');
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">` +
      `<rect width="150" height="150" fill="${color}"/>` +
      `<text x="75" y="75" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${initialsOf(name)}</text>` +
      `</svg>`
  );
}

/** Avatar genérico (silueta) en distintos colores para elegir al dar de alta un paciente. */
function silhouette(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">` +
      `<rect width="150" height="150" fill="${color}"/>` +
      `<circle cx="75" cy="58" r="26" fill="#ffffff" fill-opacity="0.92"/>` +
      `<path d="M25 138c4-30 26-46 50-46s46 16 50 46z" fill="#ffffff" fill-opacity="0.92"/>` +
      `</svg>`
  );
}

export const PRESET_AVATARS: string[] = COLORS.map(silhouette);
