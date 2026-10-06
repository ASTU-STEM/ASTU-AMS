#!/usr/bin/env python3
"""
Migrate hard-coded neutral Tailwind palette utilities onto the app's theme
tokens so a single source of truth drives light and dark.

Why this exists: the app has three competing theming strategies (CSS custom
properties, `dark:` variants, and JS ternaries). The token strategy is the one
used by src/features/alumni/components/alumniUi.ts and the admin shells, so
migrating the remaining raw `bg-white` / `border-gray-200/60` / `text-slate-600`
surfaces onto it removes the last "light leftovers" that survive a dark-mode
toggle, and makes the same element render identically on every dashboard.

Opacity handling:
  * >= 20%  -> treated as a real surface, replaced by the token
  * <  20%  -> left alone (decorative sub-alpha tints)
  * white below 45% is left alone: those are the intentional translucent chips
    layered on the navy sidebar / hero gradients and are theme-invariant.

Run from the frontend/ directory:

    python3 scripts/tokenize-surfaces.py src/features/alumni
    python3 scripts/tokenize-surfaces.py --dry-run src/layouts src/features

Regenerate src/styles/dark-mode.css afterwards; classes replaced here drop out
of the generated fallback.
"""
import re
import sys
import pathlib
import collections

TEXT_TOKENS = {
    '900': 'var(--text-primary)', '800': 'var(--text-primary)',
    '700': 'var(--text-secondary)', '600': 'var(--text-secondary)',
    '500': 'var(--text-muted)', '400': 'var(--text-muted)',
}

NEUTRAL = r'(?:gray|slate|zinc|neutral|stone)'

# Only the light half of the palette describes a *surface*. 400+ shades are
# mid-tones used for scrims, tracks, dots and de-emphasised chips; rewriting
# those onto bg-page would flatten them (a modal's `bg-slate-950/50` scrim and a
# `bg-slate-200` button are both light-theme-safe but not surface tokens).
LIGHT_SHADES = {'50', '100', '150', '200', '250', '300'}

# property -> token it should resolve to
PROP_TOKEN = {
    'bg': 'var(--bg-card)',
    'border': 'var(--border-color)',
    'divide': 'var(--border-color)',
    'ring': 'var(--border-color)',
}
INSET_BG = 'var(--bg-page)'

MIN_ALPHA = 20
MIN_WHITE_ALPHA = 45

# A white surface paired with navy text is an intentional contrast pair - an
# active-tab pill or a primary button sitting on the navy sidebar / hero. Those
# must stay white in both themes, otherwise a dark-mode pill ends up rendering
# as navy-on-navy. Detect them by their navy text companion rather than by
# guessing from the background alone.
NAVY_TEXT = re.compile(
    r'text-\[?#0(?:03366|03580|02244|02560)\]?|text-astu-navy|text-\[#003366\]'
)

# Class strings guarded by a dark-mode ternary already spell out correct values
# for BOTH themes, e.g. `darkMode ? 'text-slate-400' : 'text-gray-900'`. Those
# branches must not be tokenized: in the dark branch `text-slate-400` (#94a3b8)
# is already the right contrast, whereas --text-muted resolves to #555b72 and
# would be near-invisible. State ternaries (isSelected, active, ...) are not
# dark-conditional and are still converted.
DARK_TERNARY = re.compile(r'\b(?:darkMode|isDark|theme\s*\.\s*dark|prefersDark)\s*\?')

PAT = re.compile(
    r'(?<![:\w-])'                       # never match inside `dark:bg-gray-50`
    r'((?:hover:|focus:|active:|group-hover:)?'
    r'(bg|border|divide|ring)-'
    r'(?:(white)|' + NEUTRAL + r'-(\d{2,3}))'
    r'(?:/(\d{1,3}))?)'
    r'(?![/\w-])'
)


def replacement(prop: str, family: str, shade: str, alpha: str, variant: str,
                line: str = ''):
    if family != 'white' and shade not in LIGHT_SHADES:
        return None
    if family == 'white':
        # A white border/ring is always a separator drawn on a coloured or navy
        # surface (status dots, badges, the ID-scan corners). Remapping it to
        # --border-color turns those separators grey in dark mode.
        if prop != 'bg':
            return None
        if NAVY_TEXT.search(line):
            return None
        if alpha is not None and int(alpha) < MIN_WHITE_ALPHA:
            return None
        return f'{variant}bg-[{PROP_TOKEN["bg"]}]'
    if alpha is not None and int(alpha) < MIN_ALPHA:
        return None
    if prop == 'bg':
        # Inset panels and table stripes sit on the card, so they take the page
        # token rather than a second opaque white.
        value = INSET_BG
    else:
        value = PROP_TOKEN[prop]
    return f'{variant}{prop}-[{value}]'


def convert(text: str, stats):
    """Rewrite neutral surface utilities to theme tokens, line by line.

    Line-scoped because the navy-text guard needs the surrounding class list.
    A false skip is harmless (the generated CSS still covers that class); a
    false rewrite would destroy contrast, so the scope is kept narrow.
    """
    out_lines = []
    for line in text.split('\n'):
        out_lines.append(convert_line(line, stats))
    return '\n'.join(out_lines)


def convert_line(line: str, stats):
    if DARK_TERNARY.search(line):
        stats['<skipped: dark ternary>'] += 1
        return line

    def sub(m):
        cls, prop, family, shade, alpha = m.groups()
        variant = ''
        if ':' in cls:
            variant, _ = cls.split(':', 1)
            variant += ':'
        out = replacement(prop, family or '', shade, alpha, variant or '', line)
        if out is None:
            return m.group(0)
        stats[out] += 1
        return out

    text = PAT.sub(sub, line)

    # Text needs its own pass: the token differs per shade.
    def text_sub(m):
        variant, shade = m.groups()
        if shade not in TEXT_TOKENS:
            return m.group(0)
        out = f'{variant}text-[{TEXT_TOKENS[shade]}]'
        stats[out] += 1
        return out

    return re.sub(
        r'(?<![:\w-])((?:hover:|focus:|group-hover:)?)text-' + NEUTRAL + r'-(\d{3})(?![/\w-])',
        text_sub,
        text,
    )


def main(argv):
    dry = '--dry-run' in argv
    roots = [a for a in argv[1:] if not a.startswith('-')]
    if not roots:
        print(__doc__)
        return 1
    stats = collections.Counter()
    for root in roots:
        for f in sorted(pathlib.Path(root).rglob('*.tsx')):
            original = f.read_text()
            updated = convert(original, stats)
            if updated != original and not dry:
                f.write_text(updated)
    print(f"{'would rewrite' if dry else 'rewrote'} "
          f"{len(stats)} distinct utilities -> {sum(stats.values())} replacements")
    for k, v in stats.most_common(20):
        print(f"  {v:5d}  {k}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
