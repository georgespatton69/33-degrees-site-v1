#!/usr/bin/env python3
"""Third compliance pass: put the "How It Works" steps into passive voice.

248 mechanism steps across 48 pages; 48 of them led with a bare active verb
("Stimulates lipase activity...", "Triggers new blood vessel formation"), which
reads as a promise about what the product will do rather than a description of
what research measures. The newer pages (AHK-Cu, ARA-290) were already written
the other way round -- "Dermal papilla cell proliferation is stimulated in
research models" -- so this converts the other 46 to match.

The verb and the science are kept; only the voice changes. Glossary-term spans
are preserved through capture groups rather than retyped, since their
data-definition attributes are long and easy to corrupt.

Edits are confined to the inner HTML of mechanism-label spans so the same
wording elsewhere on a page is left alone.

Run from the repo root. Idempotent.
"""
import re
from pathlib import Path

ROOT = Path("/Users/georges.patton/33 degrees site v1")
G = r'(<span class="glossary-term"[^>]*>'          # opening tag of a glossary term

# order matters: the "like <lysyl oxidase>" variant must run before the bare one
RULES = [
 (G + r')sirtuins</span> \((SIRT1[-–]SIRT7)\)', None),  # placeholder, set below
]
RULES = [
 (r'Activates ' + G + r')sirtuins</span> \((SIRT1[-–]SIRT7)\)',
  r'\1Sirtuins</span> (\2) are activated'),
 (r'Activates (<span class="glossary-term"[^>]*>FAK-paxillin signaling</span>)',
  r'\1 is activated'),
 (r'Activates (<span class="glossary-term"[^>]*>AMPK</span>), the cellular energy sensor',
  r'\1, the cellular energy sensor, is activated'),
 (r'Activates (<span class="glossary-term"[^>]*>TrkB</span>) neurotrophin signaling',
  r'\1 neurotrophin signaling is activated'),
 (r'Activates copper-dependent enzymes like (<span class="glossary-term"[^>]*>lysyl oxidase</span>)',
  r'Copper-dependent enzymes such as \1 are activated'),
 (r'Activates copper-dependent enzymes', 'Copper-dependent enzymes are activated'),
 (r'Activates sirtuins \(SIRT1 to SIRT7\)', 'Sirtuins (SIRT1 to SIRT7) are activated'),
 (r'Activates telomerase enzyme expression', 'Telomerase enzyme expression is activated'),

 (r'Binds GHRH receptors on (<span class="glossary-term"[^>]*>somatotroph</span>) cells',
  r'Binding to GHRH receptors on \1 cells'),
 (r'Binds MC4R \(and other melanocortin receptors\)',
  'Binding to MC4R and other melanocortin receptors'),
 (r'Binds and inhibits the NNMT enzyme', 'Binding to and inhibition of the NNMT enzyme'),
 (r'Binds to cardiolipin on the inner membrane', 'Binding to cardiolipin on the inner membrane'),

 (r'Downregulates (<span class="glossary-term"[^>]*>NF-(?:&#954;|κ)B</span>), reducing pro-inflammatory cytokine production',
  r'\1 is downregulated, with reduced pro-inflammatory cytokine production'),
 (r'Enhances glucose uptake and fatty acid oxidation',
  'Glucose uptake and fatty acid oxidation are enhanced'),
 (r'Inhibits (<span class="glossary-term"[^>]*>NF-kB</span>) nuclear translocation',
  r'\1 nuclear translocation is inhibited'),

 (r'Modulates (<span class="glossary-term"[^>]*>BDNF and NGF</span>) gene expression',
  r'\1 gene expression is modulated'),
 (r'Modulates the (<span class="glossary-term"[^>]*>NO system</span>) (?:&mdash;|—) balancing eNOS and iNOS activity',
  r'The \1 is modulated, balancing eNOS and iNOS activity'),
 (r'Modulates GABAergic and serotonergic systems', 'GABAergic and serotonergic systems are modulated'),
 (r'Modulates central neurotransmitter systems', 'Central neurotransmitter systems are modulated'),
 (r'Modulates neurotransmitter and hormonal rhythms', 'Neurotransmitter and hormonal rhythms are modulated'),

 (r'Promotes immune cell migration to sites of inflammation',
  'Immune cell migration to sites of inflammation is promoted'),
 (r'Reduces oxidative stress and improves ATP output',
  'Oxidative stress is reduced and ATP output improved'),
 (r'Reduces pro-inflammatory cytokines while supporting anti-inflammatory mediators',
  'Pro-inflammatory cytokines are reduced while anti-inflammatory mediators are supported'),
 (r'Restores metabolic homeostasis under stress', 'Metabolic homeostasis under stress is restored'),

 (r'Stimulates (<span class="glossary-term"[^>]*>)lipase</span> activity in adipose tissue',
  r'\1Lipase</span> activity in adipose tissue is stimulated'),
 (r'Stimulates synthesis and secretion of endogenous GH',
  'Synthesis and secretion of endogenous GH is stimulated'),
 (r'Triggers (<span class="glossary-term"[^>]*>)new blood vessel formation</span>',
  r'\1New blood vessel formation</span> is triggered'),
 (r'Triggers fat breakdown without affecting IGF-1 or insulin',
  'Fat breakdown is triggered without affecting IGF-1 or insulin'),
]

LABEL = re.compile(r'(<span class="mechanism-label">)(.*?)(</span>\s*</div>)', re.S)


def convert(inner):
    for pat, rep in RULES:
        inner, n = re.subn(pat, rep, inner)
        if n:
            return inner, True
    return inner, False


def main():
    total = 0
    for p in sorted(ROOT.glob("**/index.html")):
        rel = str(p.relative_to(ROOT))
        if rel.startswith(".tmp"):
            continue
        s = orig = p.read_text()
        hits = [0]

        def sub(m):
            inner, changed = convert(m.group(2))
            if changed:
                hits[0] += 1
            return m.group(1) + inner + m.group(3)

        s = LABEL.sub(sub, s)
        if s != orig:
            p.write_text(s)
            print(f"{hits[0]:>3} steps  {rel}")
            total += hits[0]
    print(f"\ntotal steps converted: {total}")


if __name__ == "__main__":
    main()
