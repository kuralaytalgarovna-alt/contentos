import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_project_membership
from app.db.session import get_db
from app.models.project import Project, ProjectMember
from app.schemas.analytics import AnalyticsOverview
from app.services.analytics_mock import get_overview
from app.services.pdf_fonts import find_unicode_font, find_unicode_font_bold

router = APIRouter(prefix="/projects/{project_id}/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def overview(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> AnalyticsOverview:
    return get_overview(project_id)


@router.get("/report.pdf")
def report_pdf(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
):
    from fpdf import FPDF

    project = db.get(Project, project_id)
    data = get_overview(project_id)

    pdf = FPDF()
    pdf.add_page()

    regular_font = find_unicode_font()
    bold_font = find_unicode_font_bold()
    if regular_font is not None:
        pdf.add_font("Body", "", str(regular_font))
        pdf.add_font("Body", "B", str(bold_font or regular_font))
        base, bold = "Body", "Body"
    else:
        # No Unicode TTF found on this system — fall back to the core font,
        # which only renders Latin-1 correctly.
        base, bold = "Helvetica", "Helvetica"

    pdf.set_font(bold, "B", 18)
    pdf.cell(0, 12, f"Отчёт: {project.name if project else project_id}", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font(base, "", 11)
    pdf.multi_cell(0, 7, data.ai_summary, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.set_font(bold, "B", 13)
    pdf.cell(0, 10, "По платформам", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(base, "", 11)
    for p in data.platforms:
        pdf.multi_cell(
            0,
            7,
            f"{p.platform}: охват {p.reach} ({p.reach_delta_pct:+.1f}%), "
            f"ER {p.engagement_rate}% ({p.engagement_rate_delta_pct:+.1f}%), "
            f"подписчики {p.followers} ({p.followers_delta:+d})",
            new_x="LMARGIN",
            new_y="NEXT",
        )
    pdf.ln(4)

    pdf.set_font(bold, "B", 13)
    pdf.cell(0, 10, "Топ-посты", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(base, "", 11)
    for post in data.top_posts:
        pdf.multi_cell(
            0,
            7,
            f"[{post.platform}] {post.title} — охват {post.reach}, ER {post.engagement_rate}%",
            new_x="LMARGIN",
            new_y="NEXT",
        )

    buffer = io.BytesIO(pdf.output())
    buffer.seek(0)
    filename = f"contentos-report-{project_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
