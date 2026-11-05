#!/usr/bin/env python3
"""Assemble a Listmonk campaign template + body into a standalone preview.

Listmonk keeps the wrapper and the campaign body in separate records and only
joins them at send time, so neither file renders on its own. This splices them
the way Listmonk would, then rewrites the production image base to local paths
so the preview works before the art has been pushed live.

Usage:
    python3 tools/preview_campaign.py \
        --template ~/33degrees-backend/deploy/listmonk/templates/campaign-editorial.html \
        --content  ~/33degrees-backend/deploy/listmonk/templates/campaign-ghk-cu-content.html \
        --output   .tmp/preview-ghk-cu.html --local
"""
import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SITE_BASE = "https://33degreesofhealing.com"

# Listmonk/Go template directives that have no meaning outside a real send.
STUBS = {
    r"\{\{\s*UnsubscribeURL\s*\}\}": "#unsubscribe",
    r"\{\{\s*TrackLink[^}]*\}\}": "#",
    r"\{\{\s*\.Subscriber\.FirstName\s*\}\}": "Researcher",
    r"\{\{\s*\.Subscriber\.Email\s*\}\}": "researcher@example.com",
}


def main():
    ap = argparse.ArgumentParser(description="Preview a Listmonk campaign.")
    ap.add_argument("--template", required=True, type=Path,
                    help="Wrapper containing {{ template \"content\" . }}.")
    ap.add_argument("--content", required=True, type=Path)
    ap.add_argument("--output", required=True, type=Path)
    ap.add_argument("--local", action="store_true",
                    help="Point image URLs at the working copy instead of the "
                         "live site, for art that is not pushed yet.")
    a = ap.parse_args()

    for p in (a.template, a.content):
        if not p.exists():
            sys.exit(f"ERROR: not found: {p}")

    wrapper = a.template.read_text()
    body = a.content.read_text()

    slot = re.compile(r'\{\{\s*template\s+"content"\s+\.\s*\}\}')
    if not slot.search(wrapper):
        sys.exit('ERROR: template has no {{ template "content" . }} slot.')
    html = slot.sub(lambda _: body, wrapper, count=1)

    if a.local:
        html = html.replace(SITE_BASE + "/assets/", REPO.as_uri() + "/assets/")

    for pattern, repl in STUBS.items():
        html = re.sub(pattern, repl, html)

    # Any leftover {{ ... }} means a directive this script does not know about;
    # surfacing it beats shipping a preview with raw Go syntax rendered as text.
    leftover = set(re.findall(r"\{\{[^}]*\}\}", html))
    if leftover:
        print("WARNING: unstubbed directives: " + ", ".join(sorted(leftover)))

    html = (
        "<!doctype html>\n<html><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        f"<title>Preview: {a.content.stem}</title></head><body "
        "style=\"margin:0;background:#dfe9e5;\">\n" + html + "\n</body></html>\n"
    )

    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text(html)
    kb = len(html.encode()) / 1024
    note = " (Gmail clips over 102KB)" if kb > 102 else ""
    print(f"{a.output}  {kb:.0f}KB of HTML{note}")


if __name__ == "__main__":
    main()
