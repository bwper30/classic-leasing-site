/**
 * Reads the copy deck (src/content/pages/*.md) and turns its conventions into HTML.
 *
 * The deck is written for people, not a CMS: "## H1" sections hold the page heading,
 * "## H2 — Title" marks a section, "**Label** → /path" is a button, <!-- --> blocks are builder
 * notes, [SAV-010]-style keys trace claims. Notes and keys are stripped here, at build time, and
 * stay in the source files (brief s4). {{TODO: ...}} tokens render as visible markers in a
 * preview build; scripts/check-content.mjs refuses a production build that still has one.
 */

const RAW = import.meta.glob('../content/pages/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function raw(slug: string): string {
  const k = Object.keys(RAW).find(p => p.endsWith(`/${slug}.md`));
  if (!k) throw new Error(`No copy file for ${slug}`);
  return RAW[k];
}

const KEY = /\s*\[(?:[A-Z]{2,4}-\d{3}|Q\d)(?:,\s*(?:[A-Z]{2,4}-\d{3}|Q\d))*\]/g;

export function clean(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, '').replace(/\{\{TODO: licensing[\s\S]*?\}\}/g, '').replace(KEY, '');
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Inline markdown: bold, italic, TODO markers. */
export function inline(s: string): string {
  let h = esc(s.trim());
  h = h.replace(/\{\{TODO:\s*([\s\S]*?)\}\}/g, (_m, t) => `<mark class="cl-todo" title="Not settled yet">TODO: ${t.trim()}</mark>`);
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
  h = h.replace(/(\w)'(\w)/g, '$1\u2019$2').replace(/(\w)'/g, '$1\u2019');
  return h;
}

export interface Block {
  kind: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'cta' | 'rule' | 'diagram' | 'caption';
  html?: string;
  items?: string[];
  label?: string;
  href?: string;
  primary?: boolean;
  text?: string; // plain text, for matching figure placements
}

/** Section labels in the deck that are not headings on the page. */
const LABELS = /^(H1|Intro|Body|Sub-heading|Primary CTA|Secondary CTA|Closing CTA|Download|Questions|Result states|Below the checker|Button|Below the form|Confirmation message|Error messages|Form fields)$/;

export function blocks(md: string): Block[] {
  const out: Block[] = [];
  const lines = clean(md).split('\n');
  let para: string[] = [];
  let list: string[] | null = null;
  let section = '';
  const flush = () => {
    if (para.length) {
      const t = para.join(' ').trim();
      if (t && /^\*\*[^*]+\?\*\*$/.test(t)) out.push({ kind: 'h3', html: inline(t.slice(2, -2)), text: t.slice(2, -2) });
      else if (t) out.push({ kind: section === 'H1' ? 'h1' : 'p', html: inline(t), text: t.replace(/\*\*/g, '') });
    }
    para = [];
    if (list) { out.push({ kind: 'ul', items: list.map(inline) }); list = null; }
  };
  for (const line of lines) {
    const l = line.trimEnd();
    if (/^# /.test(l)) { flush(); continue; }                       // file title
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^#{2,3} (?:H2 — )?(.*)$/))) {
      flush();
      const title = m[1].trim();
      const isH3 = l.startsWith('### ') && !/^### H2 — /.test(l);
      if (LABELS.test(title)) { section = title; continue; }
      section = '';
      out.push({ kind: isH3 ? 'h3' : 'h2', html: inline(title), text: title });
      continue;
    }
    if (/^---\s*$/.test(l)) { flush(); section = ''; out.push({ kind: 'rule' }); continue; }
    if ((m = l.match(/^\*\*(.+?)\*\*\s*→\s*(\S+)/)) || (m = l.match(/^([^*].*?)\s*→\s*(\S+)$/))) {
      flush();
      out.push({ kind: 'cta', label: m[1].trim(), href: m[2].trim(), primary: section === 'Primary CTA' || section === 'Closing CTA' });
      continue;
    }
    if (/^\*\*\[DIAGRAM: money flow\]\*\*/.test(l)) { flush(); out.push({ kind: 'diagram' }); continue; }
    if ((m = l.match(/^\*Caption:\*\s*(.*)$/))) { flush(); para = [m[1]]; out.push({ kind: 'caption', html: '' }); continue; }
    if ((m = l.match(/^- (.*)$/))) { if (para.length) { const p = para; para = []; out.push({ kind: 'p', html: inline(p.join(' ')), text: p.join(' ') }); } (list ??= []).push(m[1]); continue; }
    if (!l.trim()) { flush(); continue; }
    if (list) { list[list.length - 1] += ' ' + l.trim(); continue; }
    para.push(l);
  }
  flush();
  // attach caption text to the caption marker
  for (let i = 0; i < out.length - 1; i++) {
    if (out[i].kind === 'caption' && out[i + 1].kind === 'p') { out[i].html = out[i + 1].html; out.splice(i + 1, 1); }
  }
  return out;
}

/** Text of a labelled section ("## Intro", "## H2 — Payroll", "### State 1 — Looks eligible"). */
export function section(md: string, title: string): string {
  const lines = clean(md).split('\n');
  const start = lines.findIndex(l => new RegExp(`^#{2,3} (?:H2 — )?${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`).test(l));
  if (start < 0) throw new Error(`Section not found: ${title}`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(l => /^#{2,3} /.test(l) || /^---\s*$/.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n').trim();
}

/** Paragraphs of a section as HTML strings. */
export function paras(md: string, title: string): string[] {
  return section(md, title).split(/\n\s*\n/).map(p => p.replace(/\n/g, ' ').trim()).filter(Boolean).map(inline);
}

/** "**Label**\nHint" pairs from a form-fields section. */
export function fields(md: string, title: string): { label: string; hint: string }[] {
  const out: { label: string; hint: string }[] = [];
  for (const chunk of section(md, title).split(/\n(?=\*\*)/)) {
    const m = chunk.match(/^\*\*(.+?)\*\*(?:\s*\((optional)\))?\s*\n?([\s\S]*)$/);
    if (m) out.push({ label: m[1].trim() + (m[2] ? ' (optional)' : ''), hint: m[3].replace(/\n/g, ' ').trim() });
  }
  return out;
}

/** Page title and meta description from the global copy file. */
export function meta(page: string, fallbackTitle?: string): { title: string; description: string } {
  const g = clean(raw('global'));
  const i = g.indexOf(`**${page}**`);
  if (i < 0) {
    if (fallbackTitle) return { title: fallbackTitle, description: '' };
    throw new Error(`No meta for ${page}`);
  }
  const chunk = g.slice(i, g.indexOf('\n\n**', i + 4) > 0 ? g.indexOf('\n\n**', i + 4) : undefined);
  const title = (chunk.match(/Title:\s*(.+)/) || [])[1]?.trim() ?? page;
  const desc = (chunk.match(/Description:\s*([\s\S]+?)(?:\n\n|$)/) || [])[1]?.replace(/\n/g, ' ').trim() ?? '';
  return { title, description: desc };
}
