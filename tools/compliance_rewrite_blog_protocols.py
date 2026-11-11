#!/usr/bin/env python3
"""Same cleanup as tools/compliance_rewrite_protocols.py, for the 12 blog guides.

The blog markup differs from the product pages (bare h2/h3 + paragraphs rather
than a pdp-info-block wrapper) and the paragraphs carry citation links that must
survive, so each one is edited surgically instead of being replaced wholesale.
Only the clauses naming a route of administration, a reconstitution step or a
dose are removed.

Run from the repo root. Idempotent.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/georges.patton/33 degrees site v1")
BACWATER = r'<span class="glossary-term"[^>]*>bacteriostatic water</span>'
STORED = "stored refrigerated and protected from light"

EDITS = {
 "blog/collagen-synthesis-guide": [
   (r'GHK-Cu is studied in both injectable and topical formats\. In preclinical research, it is reconstituted from lyophilized powder with ' + BACWATER +
    r'\. Topical applications have been explored in dermatological research contexts, while subcutaneous administration is used in systemic studies\.',
    f'GHK-Cu is supplied as a lyophilized powder and {STORED}. Published work examines it in both solution and topical research formats.'),
 ],
 "blog/endocrine-pathways-guide": [
   (r'Retatrutide is currently under clinical investigation as a subcutaneous injection\. Research protocols are defined within the context of ongoing clinical trials\.',
    'Retatrutide remains under active clinical investigation, and published endpoints are defined within the context of those trials.'),
 ],
 "blog/gh-signaling-guide": [
   (r'In published research, Ipamorelin is supplied as a lyophilized powder and reconstituted with ' + BACWATER +
    r'\. It is typically administered via subcutaneous injection\.',
    f'Ipamorelin is supplied as a lyophilized powder and {STORED}. Published research measures growth hormone pulse amplitude alongside cortisol, ACTH, and prolactin as control markers.'),
 ],
 "blog/immune-signaling-guide": [
   (r'In immune-focused studies, BPC-157 is reconstituted with ' + BACWATER + r' and administered via subcutaneous injection\.',
    f'BPC-157 is supplied as a lyophilized powder and {STORED}. Immune-focused studies measure leukocyte migration and cytokine endpoints in animal models.'),
   (r'TB-500 is reconstituted from lyophilized powder with bacteriostatic water and administered subcutaneously or intramuscularly\.',
    f'TB-500 is supplied as a lyophilized powder and {STORED}.'),
   (r' Loading phases followed by maintenance dosing are common across published models\.', ''),
 ],
 "blog/mitochondrial-function-guide": [
   (r'Dosing varies widely by model system and research objective\.',
    'Study design varies widely by model system and research objective.'),
 ],
 "blog/neuro-signaling-guide": [
   (r'In published research, the Semax peptide is typically studied in rodent models via intranasal or systemic administration\. A single application \(50 &micro;g/kg\) has been reported',
    'In published research, the Semax peptide is typically studied in rodent models. A single application has been reported'),
 ],
 "blog/tissue-response-guide": [
   (r'In published research, BPC-157 is typically reconstituted with ' + BACWATER + r' and administered via subcutaneous injection\.',
    f'BPC-157 is supplied as a lyophilized powder and {STORED}. Published endpoints include angiogenesis markers and tissue morphology in animal models.'),
 ],
 "blog/what-is-epithalon": [
   (r'Epithalon is supplied as a lyophilized \(freeze-dried\) powder and reconstituted with bacteriostatic water before use\. In preclinical studies it is typically administered via subcutaneous injection, with protocols varying by study design\.',
    f'Epithalon is supplied as a lyophilized (freeze-dried) powder and {STORED}.'),
 ],
 "blog/what-is-mots-c": [
   (r'MOTS-c is typically supplied as a lyophilized peptide and reconstituted with bacteriostatic water for subcutaneous injection\.',
    f'MOTS-c is typically supplied as a lyophilized peptide and {STORED}.'),
 ],
 "blog/what-is-nad-plus": [
   (r'Dosing varies widely by model system and research objective\.',
    'Study design varies widely by model system and research objective.'),
 ],
 "blog/what-is-pinealon": [
   (r'Pinealon is supplied as a lyophilized powder and reconstituted with bacteriostatic water\. In preclinical research it is typically administered by injection and studied for effects on neuronal oxidative-stress markers and behavioral endpoints in animal models\.',
    f'Pinealon is supplied as a lyophilized powder and {STORED}. Preclinical research measures neuronal oxidative-stress markers and behavioral endpoints in animal models.'),
 ],
 "blog/what-is-ss-31": [
   (r'SS-31 is typically reconstituted from lyophilized powder and administered via subcutaneous injection\.',
    f'SS-31 is supplied as a lyophilized powder and {STORED}.'),
 ],
}

HEADING = re.compile(r'(<h[23]>)Common Research Protocols(</h[23]>)')
COMMENT = re.compile(r'(<!-+ *)Research Protocols( *=*-* *-->)')


def main():
    failures = []
    for page, edits in sorted(EDITS.items()):
        p = ROOT / page / "index.html"
        s = orig = p.read_text()
        for pat, rep in edits:
            s, n = re.subn(pat, rep, s)
            if n == 0 and re.search(pat, orig) is None and rep.split(".")[0] not in s:
                failures.append(f"{page}: pattern not found -> {pat[:70]}")
        s = HEADING.sub(r'\1Handling &amp; Storage\2', s)
        s = COMMENT.sub(r'\1Handling and Storage\2', s)
        if s != orig:
            p.write_text(s)
            print("updated", page)
        else:
            print("no change", page)
    if failures:
        print("\nFAILURES:"); [print("  ", f) for f in failures]; sys.exit(1)


if __name__ == "__main__":
    main()
