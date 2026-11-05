#!/usr/bin/env python3
"""Build an HNR-style 33 Degrees Instagram reel: overlay branded, compliant text
onto a background video (Higgsfield/Veo/any 9:16 clip).

Produces a 1080x1920 MP4 with:
  - Top bar: tree-emblem tile + "33 DEGREES | <CATEGORY>"
  - Small disclaimer tucked under the top bar
  - Metallic silver->gold headline (compound name)
  - White subhead (Poppins SemiBold, black outline)
  - Lower-third white statement (Poppins SemiBold, black outline)
  - "How it works" + color 👇 emoji
  - Faint @handle
  - Top/bottom scrims, all text kept inside the IG reel safe zone

Everything is placed so IG's own chrome (status bar, caption, username,
add-comment bar, right-side action buttons) never covers the text.

Usage:
    python tools/build_reel.py \
        --video ~/Downloads/clip.mp4 \
        --name GLUTATHIONE \
        --category ANTIOXIDANT \
        --subhead "Combats oxidative stress" \
        --statement "by neutralizing unstable molecules called free radicals" \
        --output assets/images/marketing/glutathione-reel.mp4

Notes:
  - COMPLIANCE: statement/subhead render whatever you pass. Keep copy
    research-framed unless the user has explicitly approved a claim.
  - No dashes in copy (project style). Use commas / "or" / rewrite.
  - Background video is used as-is (no zoom). Any zoom/motion is baked into
    the source clip; regenerate the clip if you want it removed.
"""
import argparse, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
REPO = Path(__file__).resolve().parents[1]
FONTS = REPO / "assets/fonts"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"   # heavy condensed (metabolic layout)
POPPINS = str(FONTS / "Poppins-SemiBold.ttf")          # white body font (matches HNR)
POPPINS_BOLD = str(FONTS / "Poppins-Bold.ttf")         # heavy geometric sans (trio layout)
EMOJI_FONT = "/System/Library/Fonts/Apple Color Emoji.ttc"
DEFAULT_EMBLEM = REPO / "assets/images/marketing/bogo-carousel/_assets/tree-emblem.png"

SILVER=(232,232,236); PALE_GOLD=(240,223,168); DEEP_GOLD=(196,150,58)
GOLD_MUTED=(198,165,105); WHITE=(248,248,248); FAINT=(150,140,122); HANDLE=(150,135,100)
BODY=(223,223,226)   # HNR-style soft light-gray body text (not pure white)

def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"   # fall back to PATH

def font(p,s): return ImageFont.truetype(p,s)
def pop(s): return ImageFont.truetype(POPPINS,s)
def tw(f,s):
    b=f.getbbox(s); return b[2]-b[0]
def fit_font(path,text,max_w,start):
    size=start
    while size>20 and tw(font(path,size),text)>max_w: size-=3
    return font(path,size)
def wrap(text,f,max_w):
    # Explicit line breaks: use "\n" (literal) or " / " to force a break;
    # otherwise auto-wrap to fit max_w.
    text=text.replace("\\n","\n").replace(" / ","\n")
    if "\n" in text:
        out=[]
        for seg in text.split("\n"):
            out+=wrap(seg.strip(),f,max_w) if seg.strip() else [""]
        return out
    words=text.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if tw(f,t)<=max_w or not cur: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines
def centered(draw,y,s,f,fill,tracking=0,stroke=0,stroke_fill=(0,0,0)):
    if tracking==0:
        draw.text(((W-tw(f,s))/2,y),s,font=f,fill=fill,stroke_width=stroke,stroke_fill=stroke_fill); return
    ws=[tw(f,c) for c in s]; total=sum(ws)+tracking*(len(s)-1); x=(W-total)/2
    for c,cw in zip(s,ws):
        draw.text((x,y),c,font=f,fill=fill,stroke_width=stroke,stroke_fill=stroke_fill); x+=cw+tracking
def hgrad_text(base,y,s,f,stops):
    w=tw(f,s); asc,desc=f.getmetrics(); th=asc+desc
    grad=Image.new("RGB",(w,1)); n=len(stops)-1
    for x in range(w):
        t=x/max(w-1,1)*n; i=min(int(t),n-1); loc=t-i
        grad.putpixel((x,0),tuple(int(stops[i][k]+(stops[i+1][k]-stops[i][k])*loc) for k in range(3)))
    grad=grad.resize((w,th)); mask=Image.new("L",(w,th),0)
    ImageDraw.Draw(mask).text((0,0),s,font=f,fill=255)
    base.paste(grad,(int((W-w)/2),int(y)),mask)
def vscrim(base,y0,y1,a0,a1):
    h=y1-y0; mask=Image.new("L",(1,h))
    for j in range(h): mask.putpixel((0,j),int(a0+(a1-a0)*(j/max(h-1,1))))
    mask=mask.resize((W,h)); blk=Image.new("RGBA",(W,h),(0,0,0,255)); blk.putalpha(mask)
    base.alpha_composite(blk,(0,y0))
def render_emoji(codepoint,target_h):
    ef=ImageFont.truetype(EMOJI_FONT,160)
    tmp=Image.new("RGBA",(320,320),(0,0,0,0))
    ImageDraw.Draw(tmp).text((0,0),chr(codepoint),font=ef,embedded_color=True)
    bb=tmp.getbbox(); glyph=tmp.crop(bb)
    return glyph.resize((int(glyph.width*target_h/glyph.height),target_h))
def rounded_tile(size,radius,fill):
    t=Image.new("RGBA",(size,size),(0,0,0,0))
    ImageDraw.Draw(t).rounded_rectangle([0,0,size-1,size-1],radius=radius,fill=fill)
    return t
def solid_headline(base,y,s,f,color,glow=(245,210,130),glow_blur=18):
    """Solid-color headline with a soft glow (HNR-style, tinted to the visual)."""
    x=(W-tw(f,s))/2
    g=Image.new("RGBA",(base.width,base.height),(0,0,0,0))
    ImageDraw.Draw(g).text((x,y),s,font=f,fill=glow+(200,))
    base.alpha_composite(g.filter(ImageFilter.GaussianBlur(glow_blur)))
    ImageDraw.Draw(base).text((x,y),s,font=f,fill=color)
def soft_text(base,y,s,f,fill,shadow=(0,0,0,150),off=3,blur=4):
    """HNR-style clean text with a subtle soft drop shadow (no hard outline)."""
    x=(W-tw(f,s))/2
    layer=Image.new("RGBA",(base.width,base.height),(0,0,0,0))
    ImageDraw.Draw(layer).text((x+off,y+off),s,font=f,fill=shadow)
    base.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(base).text((x,y),s,font=f,fill=fill)
def plate(base,width,top,bottom,alpha=120,radius=30,border=(255,255,255,50),border_w=2):
    """Defined semi-transparent dark plate with a subtle border (for busy bg)."""
    w=int(width); h=int(bottom-top); m=6
    p=Image.new("RGBA",(w+m*2,h+m*2),(0,0,0,0))
    ImageDraw.Draw(p).rounded_rectangle(
        [m,m,m+w,m+h],radius=radius,fill=(0,0,0,alpha),outline=border,width=border_w)
    p=p.filter(ImageFilter.GaussianBlur(1))   # tiny blur just to anti-alias the edge
    base.alpha_composite(p,(int((W-w)/2)-m,int(top)-m))


def glow_caps(base,y,s,f,fill=(252,252,252),glow=(250,200,110),blur=24,alpha=165,tracking=0):
    """Heavy condensed caps with a soft warm glow behind them (metabolic.info look).
    No plate, no hard outline: the glow alone carries legibility over a busy clip."""
    ws=[tw(f,c) for c in s]
    total=sum(ws)+tracking*(len(s)-1) if tracking else tw(f,s)
    x0=(W-total)/2
    g=Image.new("RGBA",(base.width,base.height),(0,0,0,0)); gd=ImageDraw.Draw(g)
    if tracking:
        x=x0
        for c,cw in zip(s,ws): gd.text((x,y),c,font=f,fill=glow+(alpha,)); x+=cw+tracking
    else:
        gd.text((x0,y),s,font=f,fill=glow+(alpha,))
    base.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))
    # a second, tighter dark pass so white type still separates from a bright glow
    sh=Image.new("RGBA",(base.width,base.height),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    if tracking:
        x=x0
        for c,cw in zip(s,ws): sd.text((x,y+3),c,font=f,fill=(0,0,0,130)); x+=cw+tracking
    else:
        sd.text((x0,y+3),s,font=f,fill=(0,0,0,130))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    d=ImageDraw.Draw(base)
    if tracking:
        x=x0
        for c,cw in zip(s,ws): d.text((x,y),c,font=f,fill=fill); x+=cw+tracking
    else:
        d.text((x0,y),s,font=f,fill=fill)
    return total


def build_overlay_metabolic(a, overlay_path):
    """@metabolic.info layout: full-bleed clip, no brand bar, huge heavy-condensed
    white caps top and bottom, warm glow instead of plates."""
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    vscrim(img,0,620,180,0)
    vscrim(img,1150,1920,0,210)

    # --- top block: headline, then the function line directly under it ---
    head_f=fit_font(IMPACT,a.name,W-120,start=250)
    head_y=290
    glow_caps(img,head_y,a.name,head_f,blur=30,alpha=175)
    hb=head_f.getbbox(a.name); head_bottom=head_y+hb[3]

    if a.subhead:
        sub=a.subhead.upper()
        sub_f=fit_font(IMPACT,sub,W-130,start=92)
        glow_caps(img,head_bottom+16,sub,sub_f,blur=20,alpha=150,tracking=2)

    # --- bottom block, stacked upward so the CTA always lands in the safe zone ---
    cta_y=1618
    if a.statement:
        st_f=font(IMPACT,76); lh=84
        st_lines=wrap(a.statement.upper(),st_f,W-120)
        first_y=cta_y-30-len(st_lines)*lh
        y=first_y
        for ln in st_lines:
            glow_caps(img,y,ln,st_f,blur=22,alpha=155,tracking=1); y+=lh
        if a.kicker:
            # Pale warm white, not gold: the clip's own highlights are gold, so
            # gold type disappears into them. Matches the reference's all-white set.
            kf=font(IMPACT,42)
            glow_caps(img,first_y-64,a.kicker.upper(),kf,fill=(252,244,228),
                      glow=(120,70,20),blur=20,alpha=200,tracking=3)

    # CTA
    d=ImageDraw.Draw(img)
    hw_f=font(IMPACT,40); hw=a.cta.upper()+"  "; emo=render_emoji(0x1F447,40)
    hw_w=tw(hw_f,hw); gx=(W-(hw_w+emo.width))/2
    sh=Image.new("RGBA",(W,H),(0,0,0,0))
    ImageDraw.Draw(sh).text((gx,cta_y+3),hw,font=hw_f,fill=(0,0,0,140))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6))); d=ImageDraw.Draw(img)
    d.text((gx,cta_y),hw,font=hw_f,fill=WHITE)
    img.alpha_composite(emo,(int(gx+hw_w),cta_y-(emo.height-40)//2)); d=ImageDraw.Draw(img)

    # handle + disclaimer (disclaimer stays on the art: workflow requirement)
    if a.handle:
        centered(d,1700,a.handle,font(ARIAL_BOLD,21),HANDLE,tracking=3)
    if a.disclaimer:
        centered(d,1744,a.disclaimer,font(ARIAL,18),FAINT)

    img.save(overlay_path)


CHIP_COLORS={"red":(255,74,58),"green":(74,226,118),"blue":(86,164,255),
             "gold":(240,196,92),"teal":(72,214,206),"purple":(176,126,255),
             "orange":(255,150,60),"white":(235,235,235)}


def parse_chips(spec):
    """'BPC-157:red,TB-500:green,GHK-Cu:blue' -> [(label,(r,g,b)), ...]"""
    out=[]
    for part in [p.strip() for p in spec.split(",") if p.strip()]:
        label,_,col=part.partition(":")
        out.append((label.strip(),CHIP_COLORS.get(col.strip().lower(),CHIP_COLORS["white"])))
    return out


def draw_chips(base,y,chips,size=42,pad_x=30,pad_y=15,gap=22,radius=16):
    """Row of colour-coded pills, centred. Each pill carries its own glow so the
    compound/colour pairing reads without a legend (the whole point of the layout)."""
    f=font(POPPINS_BOLD,size)
    widths=[tw(f,lab)+pad_x*2 for lab,_ in chips]
    hgt=size+pad_y*2
    total=sum(widths)+gap*(len(chips)-1)
    x=(W-total)/2
    for (lab,col),w in zip(chips,widths):
        glow=Image.new("RGBA",(base.width,base.height),(0,0,0,0))
        ImageDraw.Draw(glow).rounded_rectangle([x,y,x+w,y+hgt],radius=radius,
                                               fill=col+(190,))
        base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(22)))
        pill=Image.new("RGBA",(base.width,base.height),(0,0,0,0))
        ImageDraw.Draw(pill).rounded_rectangle([x,y,x+w,y+hgt],radius=radius,
                                               fill=(0,0,0,165),outline=col+(205,),width=2)
        base.alpha_composite(pill)
        d=ImageDraw.Draw(base)
        # Centre on the glyph ink, not the font box: ascender/descender padding
        # differs per label and leaves the text sitting low in the pill.
        bb=f.getbbox(lab)
        d.text((x+(w-tw(f,lab))/2-bb[0],y+(hgt-(bb[3]-bb[1]))/2-bb[1]),
               lab,font=f,fill=WHITE)
        x+=w+gap
    return hgt


def build_overlay_trio(a, overlay_path):
    """@hnrlabs trio card: one subject, N colour-coded compounds. Heavy geometric
    sans (not condensed), lowercase subhead, colour-matched chip row near the base."""
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    vscrim(img,0,640,170,0)
    vscrim(img,1400,1920,0,185)

    if not a.no_topbar:
        bar_f=font(ARIAL_BOLD,27); trk=5
        bar=f"{a.brand}  |  {a.category}"
        centered(ImageDraw.Draw(img),52,bar,bar_f,(206,206,210),tracking=trk)

    # Impact sits well below its draw origin (43px of it at size 210), so track
    # the ink box and offset each line, or the stack drifts down onto the art.
    HEAD_GAP, SUB_GAP, SUB_LINE_GAP = 24, 44, 16
    head_f=fit_font(IMPACT,max(a.name.split(" / "),key=len),W-170,start=210)
    ink=175
    for ln in wrap(a.name,head_f,W-170):
        bb=head_f.getbbox(ln)
        solid_headline(img,ink-bb[1],ln,head_f,WHITE,glow=(235,110,90),glow_blur=34)
        ink+=(bb[3]-bb[1])+HEAD_GAP
    ink-=HEAD_GAP

    if a.subhead:
        sub_f=font(IMPACT,78)
        ink+=SUB_GAP
        for ln in wrap(a.subhead,sub_f,W-180):
            bb=sub_f.getbbox(ln)
            soft_text(img,ink-bb[1],ln,sub_f,WHITE)
            ink+=(bb[3]-bb[1])+SUB_LINE_GAP

    chips_y=1566
    if a.chips:
        draw_chips(img,chips_y,parse_chips(a.chips))

    d=ImageDraw.Draw(img)
    hw_f=font(POPPINS,34); hw=a.cta+"  "; emo=render_emoji(0x1F447,34)
    hw_w=tw(hw_f,hw); gx=(W-(hw_w+emo.width))/2
    d.text((gx,1700),hw,font=hw_f,fill=(228,228,230))
    img.alpha_composite(emo,(int(gx+hw_w),1700-(emo.height-34)//2))

    d=ImageDraw.Draw(img)
    if a.handle:
        centered(d,1786,a.handle,font(ARIAL_BOLD,21),HANDLE,tracking=4)
    if a.disclaimer:
        centered(d,1830,a.disclaimer,font(ARIAL,18),FAINT)

    img.save(overlay_path)


def build_overlay_letterbox(a, overlay_path):
    """@metabolic.info letterbox variant: hard black bands top and bottom with the
    clip showing through a center band. All type lives on the bands, not the art,
    so there is no scrim and no glow needed for legibility."""
    BAND_TOP, BAND_BOT = 670, 1517          # center band = 44% of frame height
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    d=ImageDraw.Draw(img)
    d.rectangle([0,0,W,BAND_TOP],fill=(0,0,0,255))
    d.rectangle([0,BAND_BOT,W,H],fill=(0,0,0,255))

    # --- top band: emblem, headline, function line ---
    if a.emblem and Path(a.emblem).exists():
        em=Image.open(a.emblem).convert("RGBA"); em.thumbnail((58,58))
        img.alpha_composite(em,((W-em.width)//2,96))

    head_f=fit_font(IMPACT,a.name,W-140,start=200)
    head_y=250
    glow_caps(img,head_y,a.name,head_f,fill=SILVER,glow=(110,165,230),blur=26,alpha=175)
    head_bottom=head_y+head_f.getbbox(a.name)[3]

    if a.subhead:
        sub=a.subhead.upper()
        sub_f=fit_font(IMPACT,sub,W-150,start=64)
        glow_caps(img,head_bottom+22,sub,sub_f,fill=(188,192,198),
                  glow=(90,140,205),blur=18,alpha=150,tracking=1)

    # --- bottom band: statement, then CTA ---
    y=1578
    if a.statement:
        st_f=font(IMPACT,58); lh=66
        for ln in wrap(a.statement.upper(),st_f,W-120):
            glow_caps(img,y,ln,st_f,fill=SILVER,glow=(110,165,230),blur=20,alpha=160,tracking=1)
            y+=lh
        y+=18

    hw_f=font(IMPACT,38); hw=a.cta.upper()+"  "; emo=render_emoji(0x1F447,36)
    hw_w=tw(hw_f,hw); gx=(W-(hw_w+emo.width))/2
    ImageDraw.Draw(img).text((gx,y),hw,font=hw_f,fill=GOLD_MUTED)
    img.alpha_composite(emo,(int(gx+hw_w),int(y)-(emo.height-38)//2))

    d=ImageDraw.Draw(img)
    if a.handle:
        centered(d,1862,a.handle,font(ARIAL_BOLD,19),HANDLE,tracking=3)
    if a.disclaimer:
        centered(d,1890,a.disclaimer,font(ARIAL,17),FAINT)

    img.save(overlay_path)


def build_overlay(a, overlay_path):
    img=Image.new("RGBA",(W,H),(0,0,0,0))
    vscrim(img,0,660,195,0)
    vscrim(img,1260,1920,0,205)
    d=ImageDraw.Draw(img)

    # top bar: [tree tile] BRAND | CATEGORY
    if not a.no_topbar:
        tile_sz=78; tile=rounded_tile(tile_sz,18,(24,22,18,235))
        emblem=Image.open(a.emblem).convert("RGBA"); emblem.thumbnail((62,62))
        tile.alpha_composite(emblem,((tile_sz-emblem.width)//2,(tile_sz-emblem.height)//2))
        tag_f=font(ARIAL_BOLD,30); trk=5
        left,sep,right=a.brand,"  |  ",a.category
        def seg_w(s,tk):
            ws=[tw(tag_f,c) for c in s]; return sum(ws)+tk*(len(s)-1)
        text_w=seg_w(left,trk)+seg_w(sep,0)+seg_w(right,trk); gap=22
        gx=(W-(tile_sz+gap+text_w))/2; top_y=150
        img.alpha_composite(tile,(int(gx),top_y)); d=ImageDraw.Draw(img)
        tx=gx+tile_sz+gap; ty=top_y+(tile_sz-30)/2-2
        for s,tk,col in [(left,trk,WHITE),(sep,0,FAINT),(right,trk,GOLD_MUTED)]:
            for c in s: d.text((tx,ty),c,font=tag_f,fill=col); tx+=tw(tag_f,c)+tk

    # disclaimer tucked under top bar
    if a.disclaimer:
        centered(d,234,a.disclaimer,font(ARIAL,18),FAINT)

    # headline
    head_f=fit_font(ARIAL_BOLD,a.name,W-150,start=150)
    if a.headline_style=="solid":
        solid_headline(img,308,a.name,head_f,(240,208,132))
    else:
        hgrad_text(img,308,a.name,head_f,[SILVER,PALE_GOLD,DEEP_GOLD])
    d=ImageDraw.Draw(img)

    # subhead (white Poppins + black outline), 1-2 lines centered ~y500
    sh=pop(50); sub_lines=wrap(a.subhead,sh,W-160)
    sub_top=500-((len(sub_lines)-1)*60)//2 if len(sub_lines)>1 else 500
    if a.text_bg and a.subhead and not a.no_subhead_bg:
        mw=max(tw(sh,l) for l in sub_lines)
        # Center the plate on the actual ink: equal padding above the first
        # line's cap height and below the last line's descender.
        pad=26
        vis_top=sub_top+sh.getbbox(sub_lines[0])[1]
        vis_bot=sub_top+(len(sub_lines)-1)*60+sh.getbbox(sub_lines[-1])[3]
        plate(img,mw+90,vis_top-pad,vis_bot+pad); d=ImageDraw.Draw(img)
    y=sub_top
    for ln in sub_lines: soft_text(img,y,ln,sh,BODY); y+=60
    d=ImageDraw.Draw(img)

    # lower third: optional kicker + statement, with a shared plate behind them
    st=pop(44); st_lines=wrap(a.statement,st,W-130)
    kick_f=font(ARIAL_BOLD,26)
    if a.text_bg and (a.statement or a.kicker):
        widths=[tw(st,l) for l in st_lines]
        if a.kicker: widths.append(tw(kick_f,a.kicker.upper())+3*len(a.kicker))
        mw=max(widths) if widths else 0
        # Center the plate on the actual ink (kicker top .. statement bottom)
        # with generous equal padding top and bottom.
        pad=36
        top_ink=(1420+kick_f.getbbox(a.kicker.upper())[1]) if a.kicker else (1480+st.getbbox(st_lines[0])[1])
        bot_ink=1480+(len(st_lines)-1)*56+st.getbbox(st_lines[-1])[3]
        plate(img,mw+90,top_ink-pad,bot_ink+pad); d=ImageDraw.Draw(img)
    if a.kicker:
        centered(d,1420,a.kicker.upper(),kick_f,GOLD_MUTED,tracking=3)
    y=1480
    for ln in st_lines: soft_text(img,y,ln,st,BODY); y+=56
    d=ImageDraw.Draw(img)

    # CTA "How it works 👇"
    hw_f=font(ARIAL,32); hw="How it works  "; emo=render_emoji(0x1F447,34)
    hw_w=tw(hw_f,hw); gx2=(W-(hw_w+emo.width))/2; cta_y=1620
    d.text((gx2,cta_y),hw,font=hw_f,fill=GOLD_MUTED)
    img.alpha_composite(emo,(int(gx2+hw_w),cta_y-(emo.height-34)//2)); d=ImageDraw.Draw(img)

    # handle
    if a.handle:
        centered(d,1690,a.handle,font(ARIAL_BOLD,21),HANDLE,tracking=3)

    img.save(overlay_path)


def main():
    ap=argparse.ArgumentParser(description="Build an HNR-style 33 Degrees IG reel.")
    ap.add_argument("--video",required=True,type=Path,help="Background 9:16 clip (mp4).")
    ap.add_argument("--output",required=True,type=Path,help="Output mp4.")
    ap.add_argument("--name",required=True,help="Headline / compound name (e.g. GLUTATHIONE).")
    ap.add_argument("--category",default="RESEARCH",help="Top-bar category (e.g. ANTIOXIDANT).")
    ap.add_argument("--subhead",default="",help="Hook line under the headline (evocative metaphor, HNR-style).")
    ap.add_argument("--kicker",default="",help="Small-caps mechanism line above the statement (HNR-style).")
    ap.add_argument("--statement",default="",help="Lower-third payoff statement (auto-wrapped).")
    ap.add_argument("--brand",default="33 DEGREES")
    ap.add_argument("--handle",default="@33DEGREESHEALING")
    ap.add_argument("--disclaimer",default="For research use only. Not for human consumption.")
    ap.add_argument("--emblem",default=str(DEFAULT_EMBLEM),type=Path)
    ap.add_argument("--headline-style",default="metallic",choices=["metallic","solid"],help="metallic silver->gold gradient, or solid tinted color with a glow (HNR-style).")
    ap.add_argument("--text-bg",action="store_true",help="Soft dark plates behind subhead + lower text (use on busy/bright clips).")
    ap.add_argument("--no-topbar",action="store_true",help="Hide the top brand|category bar + emblem tile (one-off cleaner top).")
    ap.add_argument("--no-subhead-bg",action="store_true",help="With --text-bg, skip the plate behind the subhead only (keep the lower-third plate).")
    ap.add_argument("--keep-overlay",action="store_true",help="Keep the overlay PNG next to the output.")
    ap.add_argument("--chips",default="",
                    help="Trio layout: colour-coded compound pills, "
                         "e.g. 'BPC-157:red,TB-500:green,GHK-Cu:blue'. "
                         f"Colours: {', '.join(CHIP_COLORS)}.")
    ap.add_argument("--layout",default="brand",choices=["brand","metabolic","letterbox","trio"],
                    help="brand = 33D/HNR template (top bar, plates). metabolic = @metabolic.info "
                         "look: full-bleed, no brand bar, heavy condensed white caps with a glow. "
                         "letterbox = same look but hard black bands top/bottom, clip in a center band.")
    ap.add_argument("--cta",default="How it works",help="CTA text before the pointing emoji.")
    a=ap.parse_args()
    for p in (a.video,a.emblem):
        if not Path(p).exists(): sys.exit(f"ERROR: not found: {p}")

    a.output.parent.mkdir(parents=True,exist_ok=True)
    overlay=a.output.with_name(a.output.stem+"-overlay.png")
    {"metabolic":build_overlay_metabolic,
     "letterbox":build_overlay_letterbox,
     "trio":build_overlay_trio}.get(a.layout,build_overlay)(a,overlay)
    print(f"Overlay: {overlay} ({a.layout} layout)")

    ff=ffmpeg_exe()
    vf=("[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];"
        "[bg][1:v]overlay=0:0[v]")
    cmd=[ff,"-y","-i",str(a.video),"-i",str(overlay),"-filter_complex",vf,"-map","[v]","-an",
         "-c:v","libx264","-pix_fmt","yuv420p","-r","24","-movflags","+faststart",str(a.output)]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode!=0: print(r.stderr[-2000:]); sys.exit(1)
    if not a.keep_overlay:
        try: overlay.unlink()
        except OSError: pass
    print(f"Created: {a.output}")


if __name__=="__main__":
    main()
