#!/usr/bin/env python3
"""
Report elements whose background token now equals their container's token.

Tokenizing collapses distinct light shades onto two surfaces: --bg-card (raised)
and --bg-page (inset). That is correct for most cases but destroys contrast when
a *control* - button, chip, pill, badge - sat on a panel that now resolves to the
same token, because `bg-slate-100` on `bg-slate-50` was a visible step and
`bg-[var(--bg-page)]` on `bg-[var(--bg-page)]` is invisible.

The scanner is line-based: for every className line that looks like a control,
it walks upwards to the nearest ancestor line carrying a background and reports
the pair when both resolve to the same token.

    python3 scripts/check-surface-collisions.py src/features/admin
    python3 scripts/check-surface-collisions.py src --summary
"""
import re
import sys
import pathlib
import collections

TOKENS = ('bg-[var(--bg-card)]', 'bg-[var(--bg-page)]')

# A control is a rounded element with tight padding or an explicit button role.
CONTROL = re.compile(
    r'\b(?:<button|<a\b|type="button")'
    r'|(?:rounded-(?:full|md|lg|xl|2xl))[^"]*\b(?:px-1\.5|px-2|px-2\.5|px-3|py-0\.5|py-1|py-1\.5)\b'
)
ANCESTOR_BG = re.compile(r'\b(bg-\[var\(--bg-[a-z]+\)\]|bg-\[(?:#[0-9a-fA-F]{3,8})\]|bg-(?:slate|gray|white)-\d{3})\b')


def scan(root):
    hits = []
    for f in sorted(pathlib.Path(root).rglob('*.tsx')):
        lines = f.read_text().split('\n')
        for i, line in enumerate(lines):
            if 'className' not in line or not CONTROL.search(line):
                continue
            own = {m.group(1) for m in ANCESTOR_BG.finditer(line)}
            if not own & set(TOKENS):
                continue
            for j in range(i - 1, max(-1, i - 14), -1):
                cand = lines[j]
                if 'className' not in cand:
                    continue
                up = {m.group(1) for m in ANCESTOR_BG.finditer(cand)}
                shared = (own & up) & set(TOKENS)
                if shared:
                    hits.append((f, i + 1, sorted(shared)[0], line.strip(), cand.strip()))
                break
    return hits


def main(argv):
    summary = '--summary' in argv
    roots = [a for a in argv[1:] if not a.startswith('-')]
    total = 0
    per_root = collections.Counter()
    for root in roots or ['src']:
        for f, ln, tok, line, anc in scan(root):
            total += 1
            per_root[tok] += 1
            if not summary:
                print(f"{f}:{ln}  both {tok}")
                print(f"    control : {line[:130]}")
                print(f"    ancestor: {anc[:130]}")
    print(f"\n{total} possible invisible controls"
          + (f"  ({dict(per_root)})" if summary else ""))
    print("Review each: lift the control to the other token, or add a border.")
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
