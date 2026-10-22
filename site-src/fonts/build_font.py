"""Build the AHRDVS Sculptural web font from the brand alphabet specimen.

    python3 -I site-src/fonts/build_font.py      (needs: pip install fonttools brotli)

Source: sculptural-07-specimen.svg ("AHRENDEZVOUS / SCULPTURAL 07, Brand
alphabet / Development 3.0"). Its 26 capitals are drawn in font units
(baseline 0, cap height 700, y up); the ten numerals are one combined path in
page pixels, split here by subpath. Per the specimen, lowercase keys produce
small caps, so a-z are the capitals scaled to SMALL_CAP. The specimen carries
no punctuation; browsers draw any missing character from the next font in the
CSS stack (Domine on this site).

Spacing: the designer's left sidebearings (32-64 units) are kept as drawn and
right sidebearings follow the table below. The specimen's AHRENDEZVOUS lockup
is set tighter (about 20-30 units between letters), which suits a logo; the
headline text is set a touch looser. Swash letters (R tail, V flourish) let
their swash overhang the next letter, as they do in the lockup.
"""
import os
import re

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path.parser import parse_path
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
SPECIMEN = os.path.join(HERE, 'sculptural-07-specimen.svg')
OUT = os.path.join(HERE, 'ahrdvs-sculptural.woff2')

FAMILY = 'AHRDVS Sculptural'
UPM = 1000
CAP = 700
SMALL_CAP = 0.78          # small-cap height = 546 units
SPACE = 240

# Right sidebearing per capital, in units. Positive opens space after the
# letter; negative lets a swash overhang the next one. Defaults to the
# glyph's own left sidebearing (symmetric) when not listed.
RSB = {
    'A': 34, 'B': 30, 'C': 22, 'D': 26, 'E': 18, 'F': 14, 'G': 30, 'J': 40,
    'K': 12, 'L': 8, 'P': 18, 'Q': 26, 'S': 32, 'T': 16, 'X': 18, 'Y': 14,
    'Z': 20, 'W': 14,
    'R': -360,            # tail sweeps under the next letter, as in the lockup
    'V': -170,            # top-right flourish rides over the next letter
}

# A few pairs the lockup and the proofs call for (units, applied to caps and
# small caps alike; small caps get the scaled value).
KERN = {
    ('T', 'A'): -60, ('T', 'O'): -30, ('T', 'C'): -30, ('T', 'G'): -30, ('T', 'Q'): -30,
    ('L', 'T'): -70, ('L', 'V'): -60, ('L', 'Y'): -70, ('L', 'W'): -40,
    ('P', 'A'): -50, ('F', 'A'): -40, ('Y', 'O'): -30, ('Y', 'A'): -60,
    ('W', 'O'): -20, ('W', 'A'): -40, ('A', 'V'): -40, ('A', 'Y'): -50,
    ('A', 'T'): -50, ('A', 'W'): -30, ('Z', 'V'): -60, ('K', 'O'): -20,
}

DIGIT_HEIGHT = 700        # lining figures sit at cap height

# Swash letters need room before a word space or punctuation, or the R tail
# runs into the next word ("YOUR BRAND" reads as one word). Units, caps size.
AFTER = {'R': 240, 'V': 130}

# Complementary punctuation drawn to sit with the capitals (the specimen has
# none). Dot diameter ~ stem weight. (name, unicodes, advance, path d in font units)
DOT = 118
PUNCT = [
    ('period', [0x2E], 200,
     'M100 0C133 0 159 26 159 59C159 92 133 118 100 118C67 118 41 92 41 59C41 26 67 0 100 0Z'),
    ('comma', [0x2C], 200,
     'M100 118C67 118 41 92 41 59C41 28 64 5 94 1C92 -48 70 -98 32 -142L44 -152C110 -100 159 -32 159 50'
     'C159 90 134 118 100 118Z'),
    ('quoteright', [0x27, 0x2019], 200,
     'M100 700C67 700 41 674 41 641C41 610 64 587 94 583C92 534 70 484 32 440L44 430C110 482 159 550 159 632'
     'C159 672 134 700 100 700Z'),
    ('hyphen', [0x2D], 330, 'M40 248H290V296H40Z'),
]


def recording(d, transform=None):
    rec = RecordingPen()
    pen = TransformPen(rec, transform) if transform else rec
    parse_path(d, pen)
    return rec


def bounds(rec):
    b = BoundsPen(None)
    rec.replay(b)
    return b.bounds


def split_subpaths(rec):
    subs, cur = [], []
    for op, args in rec.value:
        if op == 'moveTo' and cur:
            subs.append(cur)
            cur = []
        cur.append((op, args))
    if cur:
        subs.append(cur)
    out = []
    for s in subs:
        r = RecordingPen()
        r.value = s
        out.append(r)
    return out


def read_specimen():
    svg = open(SPECIMEN, encoding='utf-8').read()
    caps, numerals = {}, None
    tokens = re.findall(r'<path([^>]*)/>|<text[^>]*>([^<]*)</text>', svg)
    pending = None
    for path_attrs, text in tokens:
        if path_attrs:
            d = re.search(r'\sd="([^"]*)"', path_attrs).group(1)
            tr = re.search(r'transform="([^"]*)"', path_attrs).group(1)
            pending = (d, tr)
            if 'scale' not in tr and numerals is None:
                numerals = d          # first unscaled path: the 0-9 row
        elif pending and re.fullmatch(r'[A-Z]', text.strip()):
            caps[text.strip()] = pending[0]
            pending = None
    assert len(caps) == 26, sorted(caps)
    return caps, numerals


def split_numerals(d):
    """The numerals are one path in page pixels (y down, baseline 0). Group
    subpaths whose x-ranges overlap into digits, left to right = 0..9."""
    rec = recording(d)
    subs = sorted(split_subpaths(rec), key=lambda r: bounds(r)[0])
    groups = []
    for s in subs:
        x0, _, x1, _ = bounds(s)
        if groups and x0 < groups[-1]['x1']:
            groups[-1]['subs'].append(s)
            groups[-1]['x1'] = max(groups[-1]['x1'], x1)
        else:
            groups.append({'subs': [s], 'x1': x1})
    assert len(groups) == 10, len(groups)
    # flat-topped digits (1, 5, 7) give the cap-height reference
    tops = [-bounds_of(g['subs'])[1] for g in (groups[1], groups[5], groups[7])]
    scale = DIGIT_HEIGHT / (sum(tops) / len(tops))
    digits = []
    for g in groups:
        merged = RecordingPen()
        for s in g['subs']:
            merged.value.extend(s.value)
        digits.append((merged, scale))
    return digits


def bounds_of(recs):
    bs = [bounds(r) for r in recs]
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


def charstring(rec, transform, advance):
    pen = T2CharStringPen(advance, None)
    rec.replay(TransformPen(pen, transform))
    return pen.getCharString()


def main():
    caps, numerals = read_specimen()
    glyphs, metrics, cmap = {}, {}, {}

    def add(name, rec, transform, advance, code):
        out = RecordingPen()
        rec.replay(TransformPen(out, transform))
        b = bounds(out)
        glyphs[name] = charstring(rec, transform, advance)
        metrics[name] = (advance, int(round(b[0])) if b else 0)
        if code is not None:
            cmap[code] = name

    for ch, d in caps.items():
        rec = recording(d)
        x0, _, x1, _ = bounds(rec)
        rsb = RSB.get(ch, round(x0))
        advance = int(round(x1 + rsb))
        add(ch, rec, (1, 0, 0, 1, 0, 0), advance, ord(ch))
        sc = SMALL_CAP
        add(ch.lower(), rec, (sc, 0, 0, sc, 0, 0), int(round(advance * sc)), ord(ch.lower()))

    # tabular lining figures: every digit gets the widest digit's advance
    digits = split_numerals(numerals)
    widths = [(bounds(r)[2] - bounds(r)[0]) * s for r, s in digits]
    side = 45
    tab = int(round(max(widths) + 2 * side))
    names = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
    for i, ((rec, s), w) in enumerate(zip(digits, widths)):
        x0 = bounds(rec)[0]
        dx = (tab - w) / 2 - x0 * s
        add(names[i], rec, (s, 0, 0, -s, dx, 0), tab, ord('0') + i)   # y-down px -> y-up units

    for name, codes, advance, d in PUNCT:
        add(name, recording(d), (1, 0, 0, 1, 0, 0), advance, codes[0])
        for c in codes[1:]:
            cmap[c] = name

    # space + no-break space, and an empty .notdef
    empty = T2CharStringPen(SPACE, None)
    glyphs['space'] = empty.getCharString()
    metrics['space'] = (SPACE, 0)
    cmap[0x20] = 'space'
    cmap[0xA0] = 'space'
    nd = T2CharStringPen(500, None)
    glyphs['.notdef'] = nd.getCharString()
    metrics['.notdef'] = (500, 0)

    order = ['.notdef', 'space'] + [c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'] \
        + [c for c in 'abcdefghijklmnopqrstuvwxyz'] + names + [p[0] for p in PUNCT]

    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(FAMILY.replace(' ', ''), {'FullName': FAMILY}, {n: glyphs[n] for n in order}, {})
    fb.setupHorizontalMetrics({n: metrics[n] for n in order})
    fb.setupHorizontalHeader(ascent=900, descent=-250)
    fb.setupNameTable({'familyName': FAMILY, 'styleName': 'Regular',
                       'uniqueFontIdentifier': 'AHRDVS Sculptural 07 Regular',
                       'version': 'Version 0.7 (Development 3.0)'})
    fb.setupOS2(sTypoAscender=900, sTypoDescender=-250, sTypoLineGap=0,
                usWinAscent=900, usWinDescent=250, sCapHeight=CAP,
                sxHeight=int(CAP * SMALL_CAP), usWeightClass=400, achVendID='AHRD')
    fb.setupPost()

    lines = []
    for (l, r), v in KERN.items():
        lines.append(f'pos {l} {r} {v};')
        lines.append(f'pos {l} {r.lower()} {int(round(v * SMALL_CAP))};')
        lines.append(f'pos {l.lower()} {r.lower()} {int(round(v * SMALL_CAP))};')
    for ch, v in AFTER.items():
        for g in ['space', 'period', 'comma', 'quoteright', 'hyphen']:
            lines.append(f'pos {ch} {g} {v};')
            lines.append(f'pos {ch.lower()} {g} {int(round(v * SMALL_CAP))};')
    addOpenTypeFeaturesFromString(fb.font, 'feature kern {\n' + '\n'.join(lines) + '\n} kern;')

    fb.font.flavor = 'woff2'
    fb.font.save(OUT)
    fb.font.flavor = None
    fb.font.save(OUT.replace('.woff2', '.otf'))
    print(f'{os.path.basename(OUT)}: {os.path.getsize(OUT)} bytes, {len(order)} glyphs, '
          f'tabular figures {tab} units')


if __name__ == '__main__':
    main()
