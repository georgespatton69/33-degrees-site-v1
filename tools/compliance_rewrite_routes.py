#!/usr/bin/env python3
"""Second compliance pass: strip route-of-administration, reconstitution and
dosing language everywhere it survived the protocols-block rewrite.

It turned up in four more places:
  - per-compound paragraphs further down the multi-compound blog guides
  - visible FAQ answers
  - the SAME answers duplicated in FAQPage JSON-LD, which Google syndicates as
    rich results, so leaving those would publish the text more widely than the
    page itself
  - product-page stat badges ("Intranasal", "once-daily dosing")

Because the visible copy and the JSON-LD copy are near-identical strings, this
runs as plain string/regex replacements over every page and catches both.

Bac Water and RA Water are deliberately skipped, pending Anthony's call on
whether those SKUs stay.

Run from the repo root. Idempotent.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/georges.patton/33 degrees site v1")
SKIP = {"products/bac-water/index.html", "products/ra-water/index.html"}
STORED = "stored refrigerated and protected from light"

# (pattern, replacement). Longest / most specific first -- several of these
# overlap and the broad ones would otherwise eat the specific ones.
RULES = [
 # --- the multi-compound FAQ answer on the endocrine guide ---
 (r'In published research, these compounds are typically reconstituted from lyophilized powder and administered via subcutaneous injection\. '
  r'Retatrutide is under clinical investigation as a subcutaneous injection, Tesamorelin is reconstituted from lyophilized powder for subcutaneous injection, '
  r'and AOD 9604 is reconstituted with bacteriostatic water and has been investigated in both oral and injectable formats\.',
  f'In published research, these compounds are supplied as lyophilized powders and {STORED}. '
  'Retatrutide remains under clinical investigation, Tesamorelin has undergone extensive clinical evaluation, '
  'and AOD 9604 has been examined across multiple published study formats.'),

 # --- "supplied as ... reconstituted ... administered ..." in all its shapes ---
 (r'supplied as a lyophilized powder, reconstituted with bacteriostatic water, and typically administered via subcutaneous injection',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'supplied as a lyophilized powder, reconstituted with bacteriostatic water, and administered via subcutaneous injection',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'supplied as a lyophilized powder, reconstituted with bacteriostatic water, and administered subcutaneously in preclinical models',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'supplied as a lyophilized powder, reconstituted with bacteriostatic water, and administered by injection in preclinical and animal models',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'supplied as a lyophilized peptide and reconstituted with bacteriostatic water for subcutaneous injection in preclinical models',
  f'supplied as a lyophilized peptide and {STORED}'),
 (r'typically supplied as a lyophilized powder and reconstituted with bacteriostatic water\.',
  f'typically supplied as a lyophilized powder and {STORED}.'),
 (r'typically reconstituted from lyophilized powder and administered via subcutaneous injection in preclinical models',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'typically reconstituted with bacteriostatic water and administered via subcutaneous injection',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'reconstituted from lyophilized powder and administered via subcutaneous injection',
  f'supplied as a lyophilized powder and {STORED}'),
 (r'reconstituted with bacteriostatic water, and administered via subcutaneous injection',
  f'and {STORED}'),
 (r'In preclinical research, it is reconstituted from lyophilized powder with sterile water\.',
  'In preclinical research it is supplied as a lyophilized powder.'),

 # --- standalone route/dose sentences: these carry no other information ---
 (r' In research settings, the triple-peptide formulation is typically administered via subcutaneous injection\.', ''),
 (r' In animal studies, it is commonly administered via subcutaneous or intramuscular injection\.', ''),
 (r' In preclinical studies, it is typically administered via subcutaneous injection\.', ''),
 (r' Research dosing protocols vary, with many preclinical studies using loading phases followed by maintenance schedules\.', ''),
 (r' Specific protocols vary by study\.', ''),
 (r', while subcutaneous administration is used in systemic studies', ''),

 # --- dosing / regimen phrasing ---
 (r'Research dosing varies by study design, with many protocols exploring fasted-state administration to maximize lipolytic activity\.',
  'Study design varies, with many published protocols examining fasted-state conditions.'),
 (r'Research protocols typically involve daily administration over multi-week study periods\.',
  'Published studies typically run over multi-week periods.'),
 (r'Dosing varies widely by model system\.', 'Study design varies widely by model system.'),
 (r'which allows less frequent administration than native GHRH',
  'which distinguishes its kinetics from native GHRH'),
 (r'In preclinical studies, it has been investigated in both oral and injectable formats\.',
  'In preclinical studies it has been examined across multiple published study formats.'),

 # --- "injectable" as a product format ---
 (r'studied in both injectable and topical formats', 'studied in both solution and topical formats'),
 (r'in both injectable and topical formats', 'in both solution and topical formats'),
 (r'Its dual applicability &mdash; both topical and injectable &mdash;', 'Its dual applicability, both topical and in solution,'),
 (r'Its dual applicability — both topical and injectable —', 'Its dual applicability, both topical and in solution,'),

 # --- route framing in comparisons / findings ---
 (r'BPC-157 is frequently studied by local administration near the site of interest, while TB-500 has been studied by systemic routes',
  'BPC-157 is frequently studied in localized tissue models, while TB-500 is studied in systemic models'),
 (r'administration was reported to alter the expression', 'a single application was reported to alter the expression'),
 (r'Selank administration affects the expression', 'Selank affects the expression'),
 (r'useful comparator to direct GH administration in models', 'useful comparator to direct GH in models'),

 # --- FAQ question wording ---
 (r'How is ([A-Za-z0-9\- ]{2,24}) used in research protocols\?', r'How is \1 studied in published research?'),
 (r'How are these metabolic compounds administered in research protocols\?',
  'What are these metabolic compounds studied for?'),

 # --- product-page stat badges ---
 (r'>Intranasal</span>(\s*<span class="pdp-stat-label">)Peer-reviewed research emphasizes nasal-route CNS uptake<',
  r'>CNS Uptake</span>\1Peer-reviewed research emphasizes rapid central nervous system uptake<'),
 (r'>Intranasal</span>(\s*<span class="pdp-stat-label">)High-bioavailability nasal route research<',
  r'>High Bioavailability</span>\1Short peptide that bypasses first-pass metabolism<'),
 (r'~9-day t&frac12; enables once-daily dosing in published research',
  '~9-day t&frac12; defines the published study designs'),
 (r'~9-day t½ enables once-daily dosing in published research',
  '~9-day t½ defines the published study designs'),
 (r'>Low-Dose</span>(\s*<span class="pdp-stat-label">)Hormetic dose-response in cognitive preclinical models<',
  r'>Hormetic</span>\1Concentration-dependent response in cognitive preclinical models<'),
]


def main():
    total = 0
    for p in sorted(ROOT.glob("**/index.html")):
        rel = str(p.relative_to(ROOT))
        if rel.startswith(".tmp") or rel in SKIP:
            continue
        s = orig = p.read_text()
        n = 0
        for pat, rep in RULES:
            s, k = re.subn(pat, rep, s)
            n += k
        if s != orig:
            p.write_text(s)
            print(f"{n:>3} edits  {rel}")
            total += n
    print(f"\ntotal replacements: {total}")


if __name__ == "__main__":
    main()
