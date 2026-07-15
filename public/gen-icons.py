#!/usr/bin/env python3
"""아이콘 생성 스크립트 (Pillow)"""
import math, os
from PIL import Image, ImageDraw, ImageFont

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUT = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(OUT, exist_ok=True)

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i]-c1[i])*t) for i in range(3))

def draw_rounded_rect(draw, box, radius, fill, outline=None, width=1):
    x0,y0,x1,y1 = box
    draw.rounded_rectangle([x0,y0,x1,y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_star(draw, cx, cy, r, pts, fill):
    verts = []
    for i in range(pts*2):
        a = i*math.pi/pts - math.pi/2
        rad = r if i%2==0 else r*0.42
        verts.append((cx+math.cos(a)*rad, cy+math.sin(a)*rad))
    draw.polygon(verts, fill=fill)

def make_icon(size):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    d = ImageDraw.Draw(img)
    s = size

    # ── Background gradient (simulate with two rects) ──
    for y in range(s):
        t = y/s
        c = lerp_color((13,26,40),(26,10,0),t)
        d.line([(0,y),(s,y)], fill=c+(255,))
    # rounded mask
    mask = Image.new("L",(s,s),0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0,0,s,s], radius=int(s*.18), fill=255)
    img.putalpha(mask)
    d = ImageDraw.Draw(img)

    # ── Green glow (ChatGPT) ──
    gx,gy,gr = int(s*.35),int(s*.5),int(s*.32)
    for r in range(gr,0,-2):
        a = int(80*(1-r/gr))
        d.ellipse([gx-r,gy-r,gx+r,gy+r], fill=(16,163,127,a))

    # ── Boss (right, angry red) ──
    # Body
    draw_rounded_rect(d,[int(s*.5),int(s*.42),int(s*.88),int(s*.72)],int(s*.06),fill=(102,119,170,230),outline=(68,85,136),width=max(1,int(s*.015)))
    # Suit lapels
    d.polygon([(int(s*.5),int(s*.5)),(int(s*.62),int(s*.42)),(int(s*.65),int(s*.64))],fill=(119,136,187,200))
    d.polygon([(int(s*.88),int(s*.5)),(int(s*.76),int(s*.42)),(int(s*.73),int(s*.64))],fill=(119,136,187,200))
    # Head (red angry)
    d.ellipse([int(s*.52),int(s*.18),int(s*.88),int(s*.44)],fill=(232,64,64,240),outline=(160,32,16),width=max(1,int(s*.015)))
    # Hair
    d.ellipse([int(s*.55),int(s*.14),int(s*.86),int(s*.26)],fill=(42,34,16,230))
    # Eyes
    d.ellipse([int(s*.57),int(s*.27),int(s*.66),int(s*.35)],fill=(255,255,255))
    d.ellipse([int(s*.71),int(s*.27),int(s*.8),int(s*.35)],fill=(255,255,255))
    d.ellipse([int(s*.60),int(s*.29),int(s*.64),int(s*.33)],fill=(17,17,17))
    d.ellipse([int(s*.74),int(s*.29),int(s*.78),int(s*.33)],fill=(17,17,17))
    # Angry V-brows
    lw = max(2,int(s*.018))
    d.line([int(s*.57),int(s*.24),int(s*.64),int(s*.28)],fill=(17,17,17),width=lw)
    d.line([int(s*.73),int(s*.28),int(s*.80),int(s*.24)],fill=(17,17,17),width=lw)
    # Open mouth
    d.ellipse([int(s*.63),int(s*.36),int(s*.76),int(s*.44)],fill=(17,17,17))
    d.ellipse([int(s*.64),int(s*.37),int(s*.75),int(s*.43)],fill=(204,34,34))

    # ── ChatGPT Robot (left) ──
    # Robot body
    draw_rounded_rect(d,[int(s*.06),int(s*.48),int(s*.43),int(s*.86)],int(s*.07),fill=(30,48,64,240),outline=(16,163,127),width=max(1,int(s*.02)))
    # Robot head
    draw_rounded_rect(d,[int(s*.09),int(s*.22),int(s*.41),int(s*.48)],int(s*.06),fill=(26,42,58,240),outline=(16,163,127),width=max(1,int(s*.018)))
    # Antenna
    lw2 = max(2,int(s*.015))
    d.line([int(s*.245),int(s*.22),int(s*.245),int(s*.13)],fill=(16,163,127),width=lw2)
    d.ellipse([int(s*.22),int(s*.10),int(s*.27),int(s*.15)],fill=(16,163,127))
    d.ellipse([int(s*.225),int(s*.105),int(s*.265),int(s*.145)],fill=(100,255,200))
    # Eyes glow
    ey = int(s*.34)
    for ex in [int(s*.165),int(s*.31)]:
        d.ellipse([ex-int(s*.055),ey-int(s*.04),ex+int(s*.055),ey+int(s*.04)],fill=(10,26,20))
        d.ellipse([ex-int(s*.045),ey-int(s*.032),ex+int(s*.045),ey+int(s*.032)],fill=(16,163,127))
        d.ellipse([ex-int(s*.025),ey-int(s*.02),ex+int(s*.025),ey+int(s*.02)],fill=(100,255,200))
    # Mouth LED
    draw_rounded_rect(d,[int(s*.14),int(s*.42),int(s*.36),int(s*.47)],int(s*.01),fill=(10,26,20))
    for i in range(4):
        mx = int(s*(.16+i*.05))
        d.ellipse([mx-int(s*.012),int(s*.435),mx+int(s*.012),int(s*.46)],fill=(16,163,127))
    # Chest screen
    draw_rounded_rect(d,[int(s*.1),int(s*.53),int(s*.39),int(s*.7)],int(s*.04),fill=(10,26,20,220),outline=(16,163,127),width=max(1,int(s*.012)))
    # Charge bar
    draw_rounded_rect(d,[int(s*.115),int(s*.565),int(s*.375),int(s*.605)],int(s*.01),fill=(16,163,127))
    # "100%" text
    try:
        fsize = max(8,int(s*.07))
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", fsize)
    except:
        font = ImageFont.load_default()
    d.text((int(s*.245),int(s*.615)),"100%",fill=(0,255,180),font=font,anchor="mm" if hasattr(font,"getbbox") else None)

    # ── Beam ──
    bx0,by0 = int(s*.42),int(s*.52)
    bx1,by1 = int(s*.52),int(s*.38)
    for w,a in [(int(s*.07),40),(int(s*.03),140),(int(s*.01),220)]:
        col = (16,163,127,a) if w>int(s*.02) else (255,255,255,a)
        d.line([bx0,by0,bx1,by1],fill=col,width=w)

    # ── Sparks on boss ──
    spark_positions = [(int(s*.6),int(s*.3)),(int(s*.74),int(s*.21)),(int(s*.82),int(s*.35))]
    spark_colors = [(255,204,0,220),(255,119,0,200),(255,255,255,220)]
    for (sx,sy),sc in zip(spark_positions,spark_colors):
        draw_star(d,sx,sy,int(s*.045),5,sc)

    # ── Title text ──
    try:
        tfont = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", max(8,int(s*.075)))
    except:
        tfont = ImageFont.load_default()
    d.text((s//2, int(s*.94)), "상사혼내기", fill=(255,204,0,240), font=tfont,
           anchor="mm" if hasattr(tfont,"getbbox") else None)

    return img

for size in SIZES:
    img = make_icon(size)
    fp = os.path.join(OUT, f"icon-{size}.png")
    img.save(fp, "PNG")
    print(f"✓ icon-{size}.png")

# screenshot placeholder
sc = Image.new("RGB",(390,844),(13,26,40))
sd = ImageDraw.Draw(sc)
for y in range(844):
    t=y/844
    c=lerp_color((13,26,40),(26,10,0),t)
    sd.line([(0,y),(390,y)],fill=c)
try:
    tf=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",32)
    sf=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",20)
except:
    tf=sf=ImageFont.load_default()
sd.text((195,390),"직장상사 혼내기!",fill=(255,204,0),font=tf,anchor="mm")
sd.text((195,440),"with ChatGPT",fill=(16,163,127),font=sf,anchor="mm")
sc.save(os.path.join(OUT,"screenshot.png"),"PNG")
print("✓ screenshot.png")
print("아이콘 생성 완료!")
