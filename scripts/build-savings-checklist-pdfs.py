"""Regenerate the checked-in printable PDFs with Python and ReportLab."""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfgen.canvas import Canvas


OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "worksheets"
INK = HexColor("#173932")
GREEN = HexColor("#285348")
MUTED = HexColor("#4D625A")
LINE = HexColor("#A9B9B1")
PALE = HexColor("#EDF2ED")


def create_tracker(paper, size):
    width, height = size
    margin = 36
    content_width = width - 2 * margin
    path = OUTPUT / f"52-week-savings-tracker-{paper}.pdf"
    canvas = Canvas(str(path), pagesize=size, invariant=1)
    canvas.setTitle("52-Week Savings Challenge | Printable Tracker")
    canvas.setAuthor("Moocsoft")
    canvas.setSubject("An undated weekly deposit checklist in standard and reverse order.")

    def text(x, y, value, font="Helvetica", points=9, color=INK):
        canvas.setFont(font, points)
        canvas.setFillColor(color)
        canvas.drawString(x, y, value)

    def line(x, y, end_x, end_y, color=LINE, weight=0.55):
        canvas.setStrokeColor(color)
        canvas.setLineWidth(weight)
        canvas.line(x, y, end_x, end_y)

    def checkbox(x, y, side=8):
        canvas.setLineWidth(0.7)
        canvas.setStrokeColor(GREEN)
        canvas.rect(x, y, side, side)

    text(margin, height - 38, "MOOCSOFT", "Helvetica-Bold", 9, GREEN)
    text(margin + 66, height - 38, "/  SAVINGS WORKSHEET", points=8, color=MUTED)
    line(margin, height - 48, width - margin, height - 48, GREEN, 1.1)
    text(margin, height - 84, "52-week savings challenge", "Times-Bold", 29)
    text(margin, height - 104, "Choose one order. Check each week after setting aside the amount in that column.", points=10)
    text(margin, height - 128, "Saving for", "Helvetica-Bold", 8, MUTED)
    line(margin + 47, height - 130, width * 0.51, height - 130)
    text(width * 0.54, height - 128, "Start date", "Helvetica-Bold", 8, MUTED)
    line(width * 0.54 + 43, height - 130, width * 0.76, height - 130)
    text(width * 0.79, height - 128, "Currency", "Helvetica-Bold", 8, MUTED)
    line(width * 0.79 + 42, height - 130, width - margin, height - 130)

    band_y = height - 177
    canvas.setFillColor(PALE)
    canvas.roundRect(margin, band_y, content_width, 32, 4, stroke=0, fill=1)
    checkbox(margin + 12, band_y + 12)
    text(margin + 26, band_y + 12, "Standard  1 to 52", "Helvetica-Bold", 9)
    checkbox(margin + 141, band_y + 12)
    text(margin + 155, band_y + 12, "Reverse  52 to 1", "Helvetica-Bold", 9)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawRightString(width - margin - 12, band_y + 12, "Either plan totals 1,378")

    gap = 20
    panel_width = (content_width - gap) / 2
    top = band_y - 21
    row_top = top - 28
    row_height = (row_top - 117) / 26
    for panel, first_week in enumerate((1, 27)):
        x = margin + panel * (panel_width + gap)
        last_week = first_week + 25
        text(x, top, f"Weeks {first_week} to {last_week}", "Times-Bold", 14)
        centers = [x + panel_width * v for v in (0.095, 0.41, 0.68, 0.915)]
        canvas.setFillColor(PALE)
        canvas.rect(x, row_top, panel_width, 17, stroke=0, fill=1)
        canvas.setFillColor(GREEN)
        canvas.setFont("Helvetica-Bold", 8)
        for at, label in zip(centers, ("Week", "Standard", "Reverse", "Done")):
            canvas.drawCentredString(at, row_top + 5.3, label)
        for offset in range(26):
            week = first_week + offset
            bottom = row_top - (offset + 1) * row_height
            middle = bottom + row_height / 2
            canvas.setFillColor(INK)
            for at, number in zip(centers, (week, week, 53 - week)):
                canvas.setFont("Helvetica-Bold" if at == centers[0] else "Helvetica", 9.5)
                canvas.drawCentredString(at, middle - 3.1, str(number))
            checkbox(centers[-1] - 4, middle - 4)
            line(x, bottom, x + panel_width, bottom)
    text(margin, 95, "Actual amount saved", "Helvetica-Bold", 9)
    line(margin + 99, 93, width * 0.49, 93)
    text(width * 0.54, 95, "Last deposit date", "Helvetica-Bold", 9)
    line(width * 0.54 + 82, 93, width - margin, 93)
    text(margin, 71, "1 + 2 + ... + 52 = 1,378. The total assumes all 52 deposits, before interest or withdrawals.", points=8.4, color=MUTED)
    line(margin, 54, width - margin, 54, GREEN)
    text(margin, 39, "moocsoft.net/guides/52-week-savings-challenge/", points=8, color=MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - margin, 39, "A4" if paper == "a4" else "US Letter")
    canvas.showPage()
    canvas.save()


if __name__ == "__main__":
    create_tracker("a4", A4)
    create_tracker("us-letter", letter)
