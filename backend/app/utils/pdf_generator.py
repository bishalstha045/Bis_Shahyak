import io
import os
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)

def generate_compliance_pdf(
    product_description: str,
    standards: List[Dict[str, Any]],
    company_name: str = "Applicant / MSME",
    contact_person: str = "Quality Lead",
    language: str = "en"
) -> bytes:
    """
    Generate an official, professional BIS Compliance Checklist PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#C2410C'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        fontName='Helvetica'
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceBefore=14,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica'
    )
    
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica'
    )
    
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.white,
        fontName='Helvetica-Bold'
    )

    story = []
    
    # Top Banner / Header
    story.append(Paragraph("BUREAU OF INDIAN STANDARDS (BIS)", subtitle_style))
    story.append(Paragraph("BIS Sahayak Compliance Assessment & Action Checklist", header_title_style))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%d %B %Y, %I:%M %p IST')} | Digital Self-Assessment Guide", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#F97316'), spaceAfter=15))
    
    # Application & Product Meta Table
    meta_data = [
        [
            Paragraph("<b>Target Product / Scope:</b>", body_style),
            Paragraph(product_description, body_style)
        ],
        [
            Paragraph("<b>Applicant / Organization:</b>", body_style),
            Paragraph(company_name, body_style)
        ],
        [
            Paragraph("<b>Certification Scheme:</b>", body_style),
            Paragraph("Scheme-I (ISI Mark) / Scheme-II (CRS Compulsory Registration)", body_style)
        ],
        [
            Paragraph("<b>Assessment Status:</b>", body_style),
            Paragraph("<font color='#059669'><b>Pre-Audit Ready</b></font>", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[160, 370])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # Applicable Standards Section
    story.append(Paragraph("1. Applicable Indian Standards & Scope", section_heading))
    
    std_table_data = [[
        Paragraph("Standard Code", table_header),
        Paragraph("Standard Title", table_header),
        Paragraph("Applicable Clauses", table_header),
        Paragraph("Mandatory (QCO)", table_header),
    ]]
    
    for std in standards:
        std_table_data.append([
            Paragraph(f"<b>{std.get('standard_id', 'IS Standard')}</b>", table_text),
            Paragraph(std.get('title', 'Specification Details'), table_text),
            Paragraph(std.get('section', 'General Safety & Performance'), table_text),
            Paragraph("<font color='#DC2626'><b>Yes (QCO)</b></font>", table_text),
        ])
        
    std_table = Table(std_table_data, colWidths=[100, 220, 130, 80])
    std_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EA580C')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FFF7ED')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(std_table)
    story.append(Spacer(1, 15))
    
    # Step-by-Step Compliance Checklist
    story.append(Paragraph("2. Mandatory Conformity Assessment Checklist", section_heading))
    
    checklist_data = [
        [Paragraph("Stage", table_header), Paragraph("Requirement / Action Item", table_header), Paragraph("Clause / Protocol", table_header), Paragraph("Status", table_header)],
        [Paragraph("1. Documentation", table_text), Paragraph("Factory manufacturing process flow & machinery list submission", table_text), Paragraph("Scheme-I Form V", table_text), Paragraph("[  ] Pending", table_text)],
        [Paragraph("2. Testing Equipment", table_text), Paragraph("In-house laboratory calibrated test equipment setup", table_text), Paragraph("STI Clause 4.2", table_text), Paragraph("[  ] Verified", table_text)],
        [Paragraph("3. Sample Testing", table_text), Paragraph("Passing tests at NABL / BIS accredited laboratory", table_text), Paragraph("IS Standard Spec", table_text), Paragraph("[  ] In Review", table_text)],
        [Paragraph("4. Quality Control", table_text), Paragraph("Appointment of certified Quality Control Officer", table_text), Paragraph("BIS Act 2016", table_text), Paragraph("[  ] Complete", table_text)],
        [Paragraph("5. Factory Inspection", table_text), Paragraph("BIS Bureau Auditing officer on-site verification", table_text), Paragraph("Reg. 2018 Sec 7", table_text), Paragraph("[  ] Scheduled", table_text)],
        [Paragraph("6. ISI Marking", table_text), Paragraph("Grant of License (CML Number) & ISI label layout approval", table_text), Paragraph("IS 302 / Relevant", table_text), Paragraph("[  ] Final Step", table_text)],
    ]
    
    chk_table = Table(checklist_data, colWidths=[90, 240, 110, 90])
    chk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(chk_table)
    story.append(Spacer(1, 20))
    
    # Official Helpline & Disclaimer Box
    disclaimer_text = (
        "<b>Important Notice:</b> This compliance checklist is generated by BIS Sahayak AI Assistant for guidance and preliminary "
        "assessment purposes. For official Grant of License (CML) and statutory filing, submit applications through the "
        "Manakonline Portal (www.manakonline.in) or call the BIS National Helpline at 1800-11-4000."
    )
    disc_table = Table([[Paragraph(disclaimer_text, body_style)]], colWidths=[530])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#F59E0B')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(disc_table)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
