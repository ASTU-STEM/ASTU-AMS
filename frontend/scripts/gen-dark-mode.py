#!/usr/bin/env python3
"""
Regenerate src/styles/dark-mode.css.

Dashboards and layouts in this app total ~150 .tsx files written against the
light Tailwind palette. Rather than hand-maintain dark: variants on every
element, this scans src/layouts and src/features for light-palette utilities and
emits the variable remap rules that fix them in dark mode.

Run after changing colours anywhere in src/layouts or src/features:

    python3 scripts/gen-dark-mode.py

Every emitted selector is scoped to .app-shell and carries a :not() guard
excluding elements that already ship their own dark: variant for that property.
Without the guard the !important below would outrank the original intent and
repaint those elements with the wrong surface.

See scripts/apply-dark-shell.mjs --list for which roots carry .app-shell.
"""
import re
import pathlib
import collections

FAMILIES = set(
    'gray slate zinc neutral stone blue emerald green teal cyan sky red rose '
    'orange amber yellow indigo violet purple fuchsia pink'.split()
)

# Light shades that need to become dark surfaces, and their overlay alpha.
LIGHT_BG = {'50': '0.03', '100': '0.05', '150': '0.06', '200': '0.08', '250': '0.10', '300': '0.12'}
# Light shades that need to become the dark border token.
LIGHT_BORDER = {'100', '150', '200', '250', '300'}
# Shade -> theme text token.
TEXT_MAP = {
    '900': 'primary', '800': 'primary',
    '700': 'secondary', '600': 'secondary', '500': 'secondary',
    '400': 'muted', '300': 'muted',
}

# White surfaces are the single most common light background in the app.
#
# Low-alpha white is *not* a light surface: bg-white/5 ... bg-white/40 are
# translucent "glass" chips layered on the navy sidebar / hero gradients and look
# correct in both themes. Remapping them would flatten the navy chrome. Only
# opaque-or-near-opaque white (and white at >= NAVY_OVERLAY_MAX) is remapped.
NAVY_OVERLAY_MAX = 45
WHITE_ALPHA = {'50', '55', '60', '65', '70', '75', '80', '85', '90', '95'}

SOURCES = ('src/layouts', 'src/features', 'src/components', 'src/pages')
OUT = pathlib.Path('src/styles/dark-mode.css')
SHELL = 'app-shell'

# Arbitrary-value utilities cannot be escaped as class selectors (PostCSS
# rejects .bg-\[\#003366\]\/10 with "Unclosed string"), so a few are matched by
# attribute substring instead.
ARBITRARY = {
    'bg-[#003366]/10': 'rgba(255,255,255,0.09)',
}

VARIANTS = r'(?:hover:|focus:|active:|group-hover:|sm:|md:|lg:|xl:)?'
# Utilities whose colour is a light surface. `ring-` is included because
# Tailwind 3 emits ring colours as --tw-ring-color, which ring-1/ring-2 then
# consume, so overriding the variable repaints the ring without touching width.
PROPS = r'(bg|text|border|from|to|via|divide|ring)'

PAT = re.compile(
    r'(?:^|[\s"\'`])'
    r'(' + VARIANTS + PROPS + r'-([a-z]+)-(\d{2,3}))'
    r'(?:/([0-9]{1,3}))?(?![/\w-])'
)
PAT_WHITE = re.compile(
    r'(?:^|[\s"\'`])(' + VARIANTS + r'bg-white)(?:/([0-9]{1,3}))?(?![/\w-])'
)

# Tailwind selector escaping: ':' and '/' are both meaningful in a class
# selector and must be backslash-escaped or the rule never matches the DOM.
esc = lambda s: re.sub(r'([:/])', r'\\\1', s)


def selector(cls: str, prop: str) -> str:
    pfx = cls.split(':')[0] if ':' in cls else None
    guard = f'[class*="dark:{prop}-"]'
    base = f'.dark .{SHELL} '
    if pfx in ('hover', 'group-hover'):
        sel = f'{base}.{esc(cls)}:not({guard}):hover'
    elif pfx == 'focus':
        sel = f'{base}.{esc(cls)}:not({guard}):focus'
    elif pfx == 'active':
        sel = f'{base}.{esc(cls)}:not({guard}):active'
    else:
        sel = f'{base}.{esc(cls)}:not({guard})'
    # divide-* paints the border on the *child* elements, exactly as Tailwind
    # itself does, so the override has to target the sibling combinator too.
    if cls.split(':')[-1].startswith('divide-'):
        sel += ' > :not([hidden]) ~ :not([hidden])'
    return sel


def collect():
    """Return (prop, class, opacity) triples found in the scanned sources."""
    found = set()
    for root in SOURCES:
        base = pathlib.Path(root)
        if not base.exists():
            continue
        for f in base.rglob('*.tsx'):
            text = f.read_text()
            for cls, prop, _fam, _shade, op in PAT.findall(text):
                # Re-attach the opacity modifier: the emitted selector has to
                # match the literal DOM class (bg-slate-50/60), not the bare
                # utility (bg-slate-50), or the rule silently never applies.
                found.add((prop, f'{cls}/{op}' if op else cls, op))
            for cls, op in PAT_WHITE.findall(text):
                # Skip the intentional translucent overlays on navy chrome.
                if op and int(op) < NAVY_OVERLAY_MAX:
                    continue
                found.add(('bg', f'{cls}/{op}' if op else cls, op))
    return found


def emit(rows, decl):
    groups = collections.OrderedDict()
    for val, s in rows:
        groups.setdefault(val, []).append(s)
    out = []
    for val in sorted(groups):
        out.append(",\n".join(sorted(set(groups[val]))) + " {\n  " + decl(val) + "\n}")
    return "\n".join(out)


def main():
    bg, tx, bd, gf, gv, gt, dv, rv = [], [], [], [], [], [], [], []
    for prop, cls, op in collect():
        # Parse the palette tail without the /opacity modifier; the modifier
        # stays in `cls` so the emitted selector matches the DOM class.
        bare = cls.split(':')[-1].split('/')[0]
        if bare == 'bg-white':
            bg.append(("var(--bg-card)", selector(cls, 'bg')))
            continue
        m = re.match(r'^(?:bg|text|border|from|to|via|divide|ring)-([a-z]+)-(\d{2,3})$', bare)
        if not m:
            continue
        fam, shade = m.groups()
        if fam not in FAMILIES:
            continue
        if prop == 'bg' and shade in LIGHT_BG:
            bg.append((f"rgba(255,255,255,{LIGHT_BG[shade]})", selector(cls, 'bg')))
        elif prop == 'border' and shade in LIGHT_BORDER:
            bd.append(("var(--border-color)", selector(cls, 'border')))
        elif prop == 'divide' and shade in LIGHT_BORDER:
            dv.append(("var(--border-color)", selector(cls, 'divide')))
        elif prop == 'ring' and shade in LIGHT_BORDER:
            rv.append((f"var(--border-color)", selector(cls, 'ring')))
        elif prop == 'text' and shade in TEXT_MAP:
            tx.append((f"var(--text-{TEXT_MAP[shade]})", selector(cls, 'text')))
        elif prop in ('from', 'to', 'via') and shade in {'50', '100'}:
            row = (f"rgba(255,255,255,{LIGHT_BG.get(shade, '0.05')})", selector(cls, prop))
            {'from': gf, 'to': gt, 'via': gv}[prop].append(row)

    parts = [f"""/* GENERATED by scripts/gen-dark-mode.py - do not edit by hand.
   Sources: {' , '.join(SOURCES)}/**/*.tsx
   Scoped to: .{SHELL}

   Each selector carries a :not() guard excluding elements that already ship
   their own dark: variant for that property. Without the guard the
   !important below would outrank the original intent and repaint those
   elements with the wrong surface.
*/"""]
    parts.append(emit(bg, lambda v: f"background-color: {v} !important;"))
    parts.append("\n/* -- Text -- */")
    parts.append(emit(tx, lambda v: f"color: {v} !important;"))
    parts.append("\n/* -- Borders -- */")
    parts.append(emit(bd, lambda v: f"border-color: {v} !important;"))
    if dv:
        parts.append("\n/* -- Dividers (divide-* paints borders on children) -- */")
        parts.append(emit(dv, lambda v: f"border-color: {v} !important;"))
    if rv:
        parts.append("\n/* -- Rings (Tailwind 3 stores ring colour in --tw-ring-color) -- */")
        parts.append(emit(rv, lambda v: f"--tw-ring-color: {v} !important;"))
    if gf or gv or gt:
        parts.append("\n/* -- Gradient stops -- */")
    if gf:
        parts.append(emit(gf, lambda v: f"--tw-gradient-from: {v} var(--tw-gradient-from-position);"))
    if gv:
        parts.append(emit(gv, lambda v: f"--tw-gradient-via: {v} var(--tw-gradient-via-position);"))
    if gt:
        parts.append(emit(gt, lambda v: f"--tw-gradient-to: {v} var(--tw-gradient-to-position);"))

    parts.append(TMPL)
    OUT.write_text("\n".join(parts))
    total = len(set(s for _, s in bg + tx + bd + dv + rv))
    print(f"wrote {OUT} - {total} selectors")


# Arbitrary-value utilities cannot be written as class selectors (PostCSS
# rejects .bg-\[\#003366\]\/10 with "Unclosed string") and the palette regex does
# not match them either, so they are listed explicitly and matched by attribute
# substring.
TMPL = """
/* -- Arbitrary-value utilities --
   The active-nav pill uses an arbitrary navy tint. Matched by attribute
   substring because the class name contains [ and ]. */
.dark .app-shell [class*="bg-[#003366]/10"]:not([class*="dark:bg-"]) {
  background-color: rgba(255, 255, 255, 0.09) !important;
}

/* -- Sidebar chrome --
   Sidebar <aside> elements are the shell surface in every dashboard, so they
   get the darkest token regardless of which shell class the root carries. */
.dark .app-shell aside,
.dark aside.app-shell {
  background-color: var(--bg-sidebar) !important;
  border-right-color: var(--border-color) !important;
  color: var(--text-secondary);
}

.dark .app-shell aside.shadow-xs {
  box-shadow: none !important;
}

/* -- Form controls -- */
.dark .app-shell input,
.dark .app-shell select,
.dark .app-shell textarea {
  background-color: #1e2130 !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark .app-shell input::placeholder,
.dark .app-shell textarea::placeholder {
  color: var(--text-muted) !important;
}

/* Native select popups render with the OS palette */
.dark .app-shell select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* -- Scrollbars -- */
.dark .app-shell ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
}

.dark .app-shell ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.26);
}

/* -- Cards / surfaces that rely on box-shadow for separation -- */
.dark .app-shell .shadow-xs,
.dark .app-shell .shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24) !important;
}

.dark .app-shell .shadow-md,
.dark .app-shell .shadow-lg,
.dark .app-shell .shadow-xl {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28) !important;
}
"""

if __name__ == '__main__':
    main()
