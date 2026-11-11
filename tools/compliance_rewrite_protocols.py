#!/usr/bin/env python3
"""Replace the "Common Research Protocols" block on every product page.

The old block told the reader how to reconstitute the vial and which route to
inject it by. Route of administration and dosing on a page where the compound is
sold is the clearest intended-use evidence a chemical supplier can publish, and
it is what the Aug 2026 peptide warning letters cited.

What replaces it is "Handling & Storage": physical form, storage, and whatever
genuine research context the old paragraph carried that was not an instruction
(biomarkers, stability, published findings). Nothing here tells anyone how to
prepare or administer anything.

Run from the repo root. Idempotent: pages already converted are skipped.
"""
import re
import sys
from pathlib import Path

ROOT = Path("/Users/georges.patton/33 degrees site v1")

BLOCK = re.compile(
    r'<div class="pdp-info-block">\s*<h2>Common Research Protocols</h2>\s*.*?\s*</div>',
    re.S)

STORE_COLD = ("Store sealed vials refrigerated and protected from light.")
STORE_DRY = ("Store sealed and protected from light and moisture.")

# slug -> the paragraph that replaces the old protocols text
TEXT = {
 "5-amino-1mq": f"5-Amino-1MQ is supplied as a powder for laboratory use. {STORE_DRY} Published preclinical work reports endpoints in adipocyte energy expenditure, NAD+ salvage pathway activity, and methyl-donor ratios.",
 "ahk-cu": f"AHK-Cu is supplied as a lyophilized powder. {STORE_COLD} In preclinical studies it is evaluated at picomolar-to-nanomolar concentrations. Its small size and copper-binding profile contribute to stability in research settings.",
 "aod-9604": f"AOD 9604 is supplied as a lyophilized powder. {STORE_COLD} Published preclinical endpoints include lipase activity and lipid metabolism markers in adipose tissue.",
 "ara-290": f"ARA-290 is supplied as a lyophilized powder. {STORE_COLD} Published research measures innate repair receptor signaling endpoints, distinct from the classical erythropoietin receptor.",
 "bpc-157": f"BPC-157 is supplied as a lyophilized powder. {STORE_COLD} Published preclinical endpoints include angiogenesis markers, growth-factor receptor expression, and tissue morphology in animal models.",
 "cjc-ipamorelin": f"The CJC-1295/Ipamorelin blend is supplied as a lyophilized powder. {STORE_COLD} The &ldquo;without DAC&rdquo; (Drug Affinity Complex) designation indicates that the CJC-1295 in this formulation has a shorter half-life profile than DAC-modified analogues in the published literature.",
 "dsip": f"DSIP is supplied as a lyophilized powder. {STORE_COLD} Published studies measure endpoints in sleep architecture and neuroendocrine markers in animal models.",
 "epithalon": f"Epithalon is supplied as a lyophilized powder. {STORE_COLD} Research by Khavinson et al. reported telomerase activity in human somatic cell cultures and increased mean telomere length in those cultures.",
 "ghk-cu": f"GHK-Cu is supplied as a lyophilized powder. {STORE_COLD} A genome-wide analysis identified over 4,000 genes whose expression is influenced by GHK, and published work examines both solution and topical research formats.",
 "glow-blend": f"The Glow Blend is supplied as a lyophilized powder. {STORE_COLD} The three peptides are combined in one vial because each is studied at a different point in the tissue and pigment research literature, which otherwise requires separate preparations.",
 "glutathione": f"Glutathione is supplied as a lyophilized powder. {STORE_COLD} In research settings it is examined in both reduced (GSH) and oxidized (GSSG) forms, and the GSH:GSSG ratio is a widely used biomarker of cellular oxidative state in published studies.",
 "gold-33": f"Gold 33 is supplied as a lyophilized powder. {STORE_COLD} It remains under active clinical investigation, and published endpoints are defined within the context of those trials.",
 "ipamorelin": f"Ipamorelin is supplied as a lyophilized powder. {STORE_COLD} Published research measures growth hormone pulse amplitude alongside cortisol, ACTH, and prolactin as control markers.",
 "kisspeptin": f"Kisspeptin is supplied as a lyophilized powder. {STORE_COLD} Published research on kisspeptin-10 and kisspeptin-54 maps receptor sensitivity and LH-pulse responses.",
 "klow": f"Klow is supplied as a lyophilized powder. {STORE_COLD} Four individually studied compounds are combined in a single vial, which in research settings removes the handling complexity of four separate preparations.",
 "kpv": f"KPV is supplied as a lyophilized powder. {STORE_COLD} Its small size (three amino acids) contributes to favorable stability characteristics in research settings.",
 "lipo-c": f"LIPO-C is supplied as a solution. {STORE_COLD} Endpoints in the lipid-metabolism literature covering its individual components typically include serum lipid panels, hepatic triglyceride content, and mitochondrial respiration markers.",
 "methylene-blue": f"Methylene blue is supplied in capsule form. {STORE_DRY} Hormetic concentration-response curves are commonly reported in the published literature, with low and high concentrations producing opposite effects on mitochondrial endpoints.",
 "mots-c": f"MOTS-c is supplied as a lyophilized powder. {STORE_COLD} Published research has reported that circulating plasma MOTS-c declines with age, paralleling the decline in metabolic function.",
 "mt-2": f"MT-2 is supplied as a lyophilized powder. {STORE_COLD} Published animal-model literature notes cumulative pigmentation responses measured over multi-week study periods.",
 "nad-plus": f"NAD+ is supplied as a lyophilized powder. {STORE_COLD} Preclinical studies commonly evaluate mitochondrial respiration, sirtuin activity, and markers of cellular aging, and also study NAD+ indirectly through precursors such as NMN and NR.",
 "oxytocin": f"Oxytocin acetate is supplied as a lyophilized powder. {STORE_COLD} In research it is examined for receptor-binding characteristics and, in animal-model studies, for neuroendocrine and behavioral endpoints.",
 "pinealon": f"Pinealon is supplied as a lyophilized powder. {STORE_COLD} Preclinical research measures neuronal oxidative-stress markers and behavioral endpoints in animal models.",
 "pt-141": f"PT-141 is supplied as a lyophilized powder. {STORE_COLD} Published research measures melanocortin receptor activity, with time-to-onset endpoints recorded across multiple-hour windows.",
 "selank": f"Selank is supplied as a lyophilized powder. {STORE_COLD} Peer-reviewed studies emphasize rapid CNS uptake and measure GABAergic and serotonergic endpoints in animal models.",
 "semax": f"Semax is supplied as a lyophilized powder. {STORE_COLD} Published research emphasizes the high bioavailability of short peptides that bypass first-pass metabolism, and measures BDNF and NGF expression endpoints.",
 "sermorelin": f"Sermorelin is supplied as a lyophilized powder. {STORE_COLD} Published literature measures growth hormone pulse timing against the natural overnight GH rhythm.",
 "slu-pp-332": f"SLU-PP-332 is supplied as a powder for laboratory use. {STORE_DRY} In published rodent studies, endpoints are measured in skeletal muscle, adipose tissue, and serum metabolic markers.",
 "ss-31": f"SS-31 is supplied as a lyophilized powder. {STORE_COLD} Its small size and positive charge allow it to concentrate selectively in mitochondria, which is the basis of most published study designs.",
 "tb-500": f"TB-500 is supplied as a lyophilized powder. {STORE_COLD} No pharmacokinetic data for this fragment have been published in any species, and no standardized research protocol has been established.",
 "tesamorelin": f"Tesamorelin is supplied as a lyophilized powder. {STORE_COLD} It is one of the few GH-releasing peptides to have undergone extensive clinical evaluation, and published endpoints include IGF-1 and body-composition markers.",
 "tesofensine": f"Tesofensine is supplied in capsule form. {STORE_DRY} Published endpoints include body composition, resting energy expenditure, and serum monoamine metabolites. Its long elimination half-life is a defining feature of the published study designs.",
 "thymosin-alpha-1": f"Thymosin Alpha-1 is supplied as a lyophilized powder. {STORE_COLD} It has been examined in numerous published clinical and preclinical investigations for its immunomodulatory mechanisms and effects on T-cell populations.",
 "triz-33": f"Triz 33 is supplied as a lyophilized powder. {STORE_COLD} Published endpoints in the metabolic research literature include body composition and glycemic markers.",
 "wolverine-stack": f"Both peptides are supplied as lyophilized powders. {STORE_COLD} The bundle pairs two compounds that the published tissue-repair literature studies at different points in the same process.",
}


def main():
    changed, skipped, missing = [], [], []
    for slug, para in sorted(TEXT.items()):
        p = ROOT / "products" / slug / "index.html"
        if not p.exists():
            missing.append(slug); continue
        s = p.read_text()
        if "Common Research Protocols" not in s:
            skipped.append(slug); continue
        new = ('<div class="pdp-info-block">\n'
               '                <h2>Handling &amp; Storage</h2>\n'
               f'                <p>{para}</p>\n'
               '            </div>')
        s2, n = BLOCK.subn(new, s, count=1)
        if n == 0:
            missing.append(slug + " (wrapper did not match)"); continue
        p.write_text(s2)
        changed.append(slug)
    print(f"rewritten: {len(changed)}")
    if skipped: print("already done:", ", ".join(skipped))
    if missing:
        print("NOT CHANGED:", ", ".join(missing)); sys.exit(1)


if __name__ == "__main__":
    main()
