/**
 * The CL-01f figure set, inlined so the text takes the page's colour tokens (design system,
 * Figure component). Source of truth: Marketing collateral/13 - Images/Diagrams/figures.py —
 * regenerate there and copy both layouts into src/figures/. Never edit the SVGs here.
 */
const SVG = import.meta.glob('../figures/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function strip(svg: string): string {
  return svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\sxmlns:c2pa="[^"]*"/g, '');
}

export function figure(n: number): { wide: string; narrow: string } {
  const id = String(n).padStart(2, '0');
  const find = (narrow: boolean) => {
    const k = Object.keys(SVG).find(p => new RegExp(`/fig-${id}-[a-z-]+${narrow ? '-narrow' : ''}\\.svg$`).test(p) && (narrow || !p.endsWith('-narrow.svg')));
    if (!k) throw new Error(`Figure ${id} missing`);
    return strip(SVG[k]);
  };
  return { wide: find(false), narrow: find(true) };
}

/**
 * The money-flow diagram predates the figure set. Its own dark-mode block (with a lightened
 * oxide the brand rules out) is removed, its classes are prefixed so they cannot collide with
 * site CSS, and its colours are bound to the page tokens.
 */
export function moneyFlow(): string {
  const k = Object.keys(SVG).find(p => p.endsWith('/money-flow.svg'))!;
  let s = strip(SVG[k]);
  s = s.replace(/@media \(prefers-color-scheme: dark\)\{[\s\S]*?\}\s*\}/, '');
  const map: Record<string, string> = {
    '#1C1A17': 'var(--cl-ink,#1C1A17)', '#5A544A': 'var(--cl-muted,#5A544A)',
    '#A8431A': 'var(--cl-oxide,#A8431A)', '#FFFFFF': 'var(--cl-card,#FFFFFF)', '#D6D0C4': 'var(--cl-rule,#D6D0C4)',
  };
  s = s.replace(/<style>([\s\S]*?)<\/style>/, (_m, css: string) => {
    let c = css.replace(/:root\{\}/, '');
    for (const [hex, v] of Object.entries(map)) c = c.split(hex).join(v);
    c = c.replace(/\.(ink|muted|oxide|card|fund|flowin|flowout|lbl|sub|eyebrow)\b/g, '.mf .mf-$1');
    return `<style>${c}</style>`;
  });
  s = s.replace(/class="([^"]+)"/g, (_m, cls: string) => `class="${cls.split(/\s+/).map(c => 'mf-' + c).join(' ')}"`);
  s = s.replace('<svg ', '<svg class="mf" ');
  return s;
}
