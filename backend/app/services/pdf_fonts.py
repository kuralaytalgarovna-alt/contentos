"""Locates a Unicode-capable TTF font for PDF reports.

fpdf2's built-in core fonts (Helvetica, etc.) only support Latin-1, which
breaks on Cyrillic content — a core case for this product (see PRD, Russian
project names/niches/idea text). We register a real TTF font instead, picked
from whichever of these common system locations exists.
"""
from pathlib import Path

_CANDIDATES = [
    # Windows
    Path("C:/Windows/Fonts/arial.ttf"),
    Path("C:/Windows/Fonts/calibri.ttf"),
    # Linux (common DejaVu / Noto installs)
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    Path("/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"),
    # macOS
    Path("/Library/Fonts/Arial.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
]

_CANDIDATES_BOLD = [
    Path("C:/Windows/Fonts/arialbd.ttf"),
    Path("C:/Windows/Fonts/calibrib.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    Path("/Library/Fonts/Arial Bold.ttf"),
]


def find_unicode_font() -> Path | None:
    for path in _CANDIDATES:
        if path.exists():
            return path
    return None


def find_unicode_font_bold() -> Path | None:
    for path in _CANDIDATES_BOLD:
        if path.exists():
            return path
    return find_unicode_font()
