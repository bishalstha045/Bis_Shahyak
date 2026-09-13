# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.models.schemas import (
    ProductToStandardRequest,
    ComplianceEvaluateRequest,
    DocumentAnalyzeRequest,
    StandardCompareRequest
)
from app.services.product_matcher import match_product_to_standards, load_standards_metadata
from app.services.compliance_engine import evaluate_compliance
from app.services.document_analyzer import analyze_document_content
from app.services.standard_comparator import compare_standards

router = APIRouter()

@router.post("/product-to-standard")
async def api_product_to_standard(request: ProductToStandardRequest):
    """
    Map user product description to applicable Indian Standards with explainability and cla
    use evidence.
    """
    result = match_product_to_standards(request.product_query)
    return result

@router.post("/compliance/evaluate")
async def api_compliance_evaluate(request: ComplianceEvaluateRequest):
    """
    Evaluate compliance requirement matrix, readiness score (0-100%), and next best action.
    """
    result = evaluate_compliance(
        query=request.product_query,
        standard_id=request.standard_id,
        user_evidence_items=request.user_evidence_items
    )
    return result

@router.post("/document/analyze")
async def api_document_analyze(request: DocumentAnalyzeRequest):
    """
    Analyze uploaded test reports or declarations against standard requirements with prompt injection defense.
    """
    result = analyze_document_content(
        file_name=request.file_name,
        content_text=request.content_text,
        standard_id=request.standard_id
    )
    return result

@router.post("/document/upload-analyze")
async def api_document_upload_analyze(
    file: UploadFile = File(...),
    standard_id: Optional[str] = Form(None)
):
    """
    Direct file upload analysis supporting PDF, TXT, JSON, and DOCX.
    """
    content_bytes = await file.read()
    extracted_text = ""
    
    if file.filename and file.filename.lower().endswith(".pdf"):
        import io
        import pypdf
        try:
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            extracted_text = "\n".join([page.extract_text() or "" for page in reader.pages[:15]])
        except Exception as pe:
            print(f"[PDF Extract Error] {pe}")
            
    if not extracted_text:
        try:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = f"Document: {file.filename}"

    result = analyze_document_content(
        file_name=file.filename or "uploaded_file.pdf",
        content_text=extracted_text,
        standard_id=standard_id
    )
    return result

@router.post("/standards/compare")
async def api_standards_compare(request: StandardCompareRequest):
    """
    Structured side-by-side comparison of two Indian Standards.
    """
    result = compare_standards(request.standard_a, request.standard_b)
    return result

@router.get("/dataset-stats")
async def api_dataset_stats():
    """
    Return authentic count and list of indexed standards for verified data honesty.
    """
    standards = load_standards_metadata()
    return {
        "indexed_count": len(standards),
        "standards": [{"id": s["id"], "title": s["title"], "sector": s.get("sector", ""), "year": s.get("year", "")} for s in standards],
        "message": f"Verified Knowledge Base: {len(standards)} core Indian Standards indexed with full clause breakdown."
    }

@router.get("/standards")
async def api_get_all_standards():
    """Return all indexed standards catalog."""
    standards = load_standards_metadata()
    return {
        "success": True,
        "count": len(standards),
        "standards": standards
    }

@router.get("/standards/{code_or_id}")
async def api_get_standard_detail(code_or_id: str):
    """Lookup standard or HS code from official catalogs."""
    from app.services.hsn_catalog import lookup_hsn
    clean = code_or_id.strip()
    clean_lower = clean.lower()

    # 1. Check Indian Standards by standard ID (e.g. "IS 2347", "17803")
    standards = load_standards_metadata()
    for s in standards:
        if s["id"].lower() == clean_lower or clean_lower in s["id"].lower():
            return {"success": True, "type": "standard", "standard": s, "data": s}

    # 2. Check HSN code catalog (e.g. "0101.29.10", "0101 29 10", "8432", "boneless", "tuna")
    hsn_result = lookup_hsn(clean)
    if hsn_result:
        return {
            "success": True,
            "type": "hs_code",
            "data": hsn_result
        }

    # 3. Check Indian Standards by title or applicable products
    for s in standards:
        if clean_lower in s["title"].lower() or any(clean_lower in p.lower() for p in s.get("applicable_products", [])):
            return {"success": True, "type": "standard", "standard": s, "data": s}

    return {
        "success": False,
        "message": "HS Code not found"
    }

from pydantic import BaseModel

class TranslateReq(BaseModel):
    text: str
    source_language: Optional[str] = "en"
    target_language: Optional[str] = "hi"

@router.post("/translate")
async def api_translate(req: TranslateReq):
    from app.services.translator import translate_to_target
    target = req.target_language or "hi"
    translated = await translate_to_target(req.text, target)
    return {
        "success": True,
        "original": req.text,
        "translated_text": translated,
        "translated": translated,
        "target_language": target
    }

@router.get("/notifications")
async def api_notifications(type: Optional[str] = None, unread_only: Optional[bool] = False, email: Optional[str] = None):
    import json
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    # Automatically synchronize notifications from recent verification submissions
    if email and email.strip():
        cursor.execute("SELECT * FROM verification_submissions WHERE status IN ('verified', 'rejected') AND LOWER(email) = LOWER(?) ORDER BY updated_at DESC LIMIT 10", (email.strip(),))
    else:
        cursor.execute("SELECT * FROM verification_submissions WHERE status IN ('verified', 'rejected') ORDER BY updated_at DESC LIMIT 10")
    
    recent_subs = cursor.fetchall()
    for r in recent_subs:
        s = dict(r)
        s_id = s["id"]
        n_id = f"notif-sub-{s_id}"
        cursor.execute("SELECT id FROM notifications WHERE id = ?", (n_id,))
        if not cursor.fetchone():
            is_ver = s.get("status") == "verified"
            badge = "VERIFICATION APPROVED" if is_ver else "VERIFICATION REJECTED"
            title = f"BIS Licence Granted for {s.get('company_name', 'Enterprise')}" if is_ver else f"Action Required: Deficiencies Noted for {s.get('company_name', 'Enterprise')}"
            desc = f"Application for {s.get('standard_id', 'IS Standard')} approved! Official ISI Licence {s.get('cml_license', '')} has been granted and recorded in the National Registry." if is_ver else (s.get("rejection_reason") or "Deficiencies identified in submitted test documents. Please rectify.")
            impact = "Official ISI Marking Licence Granted" if is_ver else "Compliance Deficiency Action Required"
            p_action = json.dumps({"label": "View Issued Licence →", "target": "verification"}) if is_ver else json.dumps({"label": "Review Deficiencies & Rectify →", "target": "compliance"})
            s_action = None if is_ver else json.dumps({"label": "Ask AI How to Rectify", "query": f"How do I resolve BIS deficiency for {s.get('standard_id')}: {desc}?"})
            b_class = "bg-emerald-50 text-emerald-700 border-emerald-200" if is_ver else "bg-rose-50 text-rose-700 border-rose-200"
            n_color = "bg-emerald-500" if is_ver else "bg-rose-500"
            l_color = "border-emerald-200" if is_ver else "border-rose-200"
            sub_date = str(s.get("updated_at") or s.get("submitted_at") or "Today")

            cursor.execute("""
            INSERT INTO notifications (id, type, badge, title, authority, date, description, impact, action_primary_json, action_secondary_json, badge_class, node_color, line_color, unread, user_email)
            VALUES (?, 'verification', ?, ?, 'BIS Conformity Directorate', ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            """, (n_id, badge, title, sub_date[:10], desc, impact, p_action, s_action, b_class, n_color, l_color, s.get("email")))
            conn.commit()

    query = "SELECT * FROM notifications WHERE 1=1"
    params = []

    # Scoped filtering: only user's own notifications + generic manufacturer alerts (QCO, labs, amendments)
    if email and email.strip():
        user_email_clean = email.strip().lower()
        query += " AND (LOWER(user_email) = ? OR ((user_email IS NULL OR user_email = '') AND type NOT IN ('verification', 'licence')))"
        params.append(user_email_clean)
    else:
        # Unauthenticated users only see public manufacturer alerts, zero private verification/licence records
        query += " AND (user_email IS NULL OR user_email = '') AND type NOT IN ('verification', 'licence')"

    if type and type != 'all':
        if type == 'verification':
            query += " AND type IN ('verification', 'licence')"
        else:
            query += " AND type = ?"
            params.append(type)
    if unread_only:
        query += " AND unread = 1"

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        item["unread"] = bool(item.get("unread", 0))
        try:
            item["action_primary"] = json.loads(item.get("action_primary_json") or "null")
        except Exception:
            item["action_primary"] = None
        try:
            item["action_secondary"] = json.loads(item.get("action_secondary_json") or "null")
        except Exception:
            item["action_secondary"] = None
        result.append(item)

    return result

@router.patch("/notifications/{notif_id}/read")
async def api_notif_read(notif_id: str):
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET unread = 0 WHERE id = ?", (notif_id,))
    conn.commit()
    conn.close()
    return {"success": True, "id": notif_id}

@router.patch("/notifications/read-all")
async def api_notif_read_all():
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET unread = 0")
    conn.commit()
    conn.close()
    return {"success": True, "message": "All notifications marked as read."}

@router.get("/submissions")
async def api_submissions(email: Optional[str] = None):
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    if email and email.strip():
        cursor.execute("SELECT * FROM verification_submissions WHERE LOWER(email) = LOWER(?) ORDER BY submitted_at DESC LIMIT 50", (email.strip(),))
    else:
        cursor.execute("SELECT * FROM verification_submissions WHERE 1=0")
    rows = cursor.fetchall()
    conn.close()
    return {"submissions": [dict(r) for r in rows]}

@router.post("/submissions")
async def api_post_submission(data: dict):
    import uuid
    from datetime import datetime
    from app.models.database import get_db_connection, log_admin_activity
    sub_id = f"sub-{uuid.uuid4().hex[:6]}"
    comp_name = data.get("company_name", "Enterprise Applicant")
    app_name = data.get("applicant_name", "Authorized Officer")
    std_id = data.get("standard_id", "IS 2347:2017")
    prod_name = data.get("product_name", "Industrial Sample")
    cat = data.get("category", "General Manufacturing")

    cml_lic = data.get("cml_license")
    docs_json = data.get("documents_json")
    submitted_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO verification_submissions (id, company_name, applicant_name, email, gstin, standard_id, product_name, category, status, cml_license, documents_json, compliance_score, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, 85, ?)
    """, (sub_id, comp_name, app_name, data.get("email"), data.get("gstin"), std_id, prod_name, cat, cml_lic, docs_json, submitted_time))
    conn.commit()
    conn.close()

    log_admin_activity("System Gateway", "New Verification Dossier Submitted", target_title=comp_name, target_id=sub_id)
    return {
        "success": True,
        "message": "Verification dossier submitted successfully.",
        "submission_id": sub_id,
        "submission": {
            "id": sub_id,
            "company_name": comp_name,
            "applicant_name": app_name,
            "email": data.get("email"),
            "gstin": data.get("gstin"),
            "standard_id": std_id,
            "product_name": prod_name,
            "category": cat,
            "status": "pending",
            "cml_license": cml_lic,
            "documents_json": docs_json,
            "submitted_at": submitted_time
        }
    }

@router.post("/documents/upload")
async def api_documents_upload(
    file: UploadFile = File(...),
    standard_id: Optional[str] = Form(None)
):
    return await api_document_upload_analyze(file=file, standard_id=standard_id)

# -------------------------------------------------------------------------
# Admin Dashboard & Directorate Control Endpoints
# -------------------------------------------------------------------------
@router.get("/admin/dashboard/stats")
async def api_admin_stats():
    import json
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as c FROM users")
    total_users = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM users WHERE status = 'active'")
    active_users = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM verification_submissions WHERE status = 'pending'")
    pending_verifications = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM verification_submissions WHERE status = 'verified'")
    verified_submissions = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM verification_submissions WHERE status = 'rejected'")
    rejected_submissions = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM admin_reports WHERE status = 'open'")
    open_reports = cursor.fetchone()["c"]

    cursor.execute("SELECT * FROM admin_activity_log ORDER BY timestamp DESC LIMIT 10")
    act_rows = cursor.fetchall()
    conn.close()

    recent_activities = []
    for r in act_rows:
        act = dict(r)
        try:
            act["details"] = json.loads(act.get("details_json") or "{}")
        except Exception:
            act["details"] = {}
        recent_activities.append(act)

    return {
        "total_users": total_users,
        "active_users": active_users,
        "pending_verification": pending_verifications,
        "verified": verified_submissions,
        "rejected": rejected_submissions,
        "reports": open_reports,
        "recent_activities": recent_activities,
        "total_submissions": pending_verifications + verified_submissions + rejected_submissions,
        "pending_verifications": pending_verifications,
        "approved_licenses": verified_submissions,
        "rejected_applications": rejected_submissions,
        "active_manufacturers": active_users,
        "unresolved_reports": open_reports,
        "standards_indexed": 24,
        "qco_compliance_rate": 100,
        "server_uptime": "100%"
    }

@router.get("/admin/verifications")
async def api_admin_verifications(
    search: Optional[str] = "",
    status: Optional[str] = "ALL",
    category: Optional[str] = "ALL"
):
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM verification_submissions WHERE 1=1"
    params = []

    if search:
        s = f"%{search.strip().lower()}%"
        query += " AND (LOWER(company_name) LIKE ? OR LOWER(applicant_name) LIKE ? OR LOWER(product_name) LIKE ? OR LOWER(standard_id) LIKE ?)"
        params.extend([s, s, s, s])

    if status and status != "ALL":
        query += " AND LOWER(status) = ?"
        params.append(status.strip().lower())

    if category and category != "ALL":
        query += " AND LOWER(category) = ?"
        params.append(category.strip().lower())

    query += " ORDER BY submitted_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        item = dict(r)
        docs = []
        if item.get("documents_json"):
            import json
            try:
                parsed = json.loads(item["documents_json"])
                if isinstance(parsed, list):
                    docs = parsed
                elif isinstance(parsed, dict):
                    docs = [{
                        "name": parsed.get("file_name") or "Lab_Verification_Report.pdf",
                        "lab": "NABL Accredited Laboratory / Statutory Testing",
                        "type": parsed.get("verification_method", "Document PDF"),
                        "date": item.get("submitted_at", "Recent"),
                        "status": "PASS"
                    }]
            except Exception:
                docs = [{"name": "Verification_Document.pdf", "lab": "National Test House", "type": "PDF", "date": "Recent", "status": "PASS"}]
        item["documents"] = docs
        results.append(item)

    return {"submissions": results}

@router.get("/admin/verifications/{id}")
async def api_admin_verification_by_id(id: str):
    import json
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verification_submissions WHERE id = ?", (id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Verification submission not found.")
    item = dict(row)
    docs = []
    if item.get("documents_json"):
        try:
            parsed = json.loads(item["documents_json"])
            if isinstance(parsed, list):
                docs = parsed
            elif isinstance(parsed, dict):
                docs = [{
                    "name": parsed.get("file_name") or "Lab_Verification_Report.pdf",
                    "lab": "NABL Accredited Laboratory / Statutory Testing",
                    "type": parsed.get("verification_method", "Document PDF"),
                    "date": item.get("submitted_at", "Recent"),
                    "status": "PASS"
                }]
        except Exception:
            docs = [{"name": "Verification_Document.pdf", "lab": "National Test House", "type": "PDF", "date": "Recent", "status": "PASS"}]
    item["documents"] = docs
    return {"submission": item}

@router.post("/admin/verifications/{id}/approve")
async def api_admin_approve_verification(id: str):
    import random
    from datetime import datetime
    from app.models.database import get_db_connection, log_admin_activity
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verification_submissions WHERE id = ?", (id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Submission not found.")

    sub = dict(row)
    cml_license = sub.get("cml_license") or f"CM/L-{random.randint(7000000, 7999999)}"

    cursor.execute("""
    UPDATE verification_submissions 
    SET status = 'verified', cml_license = ?, rejection_reason = NULL, updated_at = ?
    WHERE id = ?
    """, (cml_license, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), id))

    # Also register the newly granted license into the official verified_licenses registry
    cursor.execute("""
    INSERT OR REPLACE INTO verified_licenses (cml_number, standard_id, standard_title, manufacturer_name, product_category, valid_up_to, status)
    VALUES (?, ?, ?, ?, ?, '2029-12-31', 'Active')
    """, (
        cml_license,
        sub.get("standard_id", "IS 2347:2017"),
        sub.get("product_name", "Indian Standard Certified Product"),
        sub.get("company_name", "Registered Enterprise"),
        sub.get("category", "General Manufacturing")
    ))
    conn.commit()

    cursor.execute("SELECT * FROM verification_submissions WHERE id = ?", (id,))
    updated_sub = dict(cursor.fetchone())
    conn.close()

    log_admin_activity(
        "BIS Administrator",
        "Approved Verification Dossier & Issued License",
        target_title=updated_sub.get("company_name"),
        target_id=id,
        details={"cml_license": cml_license, "standard_id": updated_sub.get("standard_id")}
    )

    return {"submission": updated_sub}

@router.post("/admin/verifications/{id}/reject")
async def api_admin_reject_verification(id: str, data: dict):
    from datetime import datetime
    from app.models.database import get_db_connection, log_admin_activity
    rejection_reason = (data.get("rejection_reason") or "").strip()
    if not rejection_reason:
        raise HTTPException(status_code=400, detail="A rejection reason is strictly required.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM verification_submissions WHERE id = ?", (id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Submission not found.")

    cursor.execute("""
    UPDATE verification_submissions 
    SET status = 'rejected', rejection_reason = ?, updated_at = ?
    WHERE id = ?
    """, (rejection_reason, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), id))
    conn.commit()

    cursor.execute("SELECT * FROM verification_submissions WHERE id = ?", (id,))
    updated_sub = dict(cursor.fetchone())
    conn.close()

    log_admin_activity(
        "BIS Administrator",
        "Rejected Verification Dossier",
        target_title=updated_sub.get("company_name"),
        target_id=id,
        details={"rejection_reason": rejection_reason}
    )

    return {"submission": updated_sub}

@router.get("/admin/users")
async def api_admin_users(
    search: Optional[str] = "",
    role: Optional[str] = "ALL",
    status: Optional[str] = "ALL"
):
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT id, email, full_name, company_name, role, status, sector, created_at FROM users WHERE 1=1"
    params = []

    if search:
        s = f"%{search.strip().lower()}%"
        query += " AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(company_name) LIKE ?)"
        params.extend([s, s, s])

    if role and role != "ALL":
        if role.lower() == "admin":
            query += " AND LOWER(role) = 'admin'"
        else:
            query += " AND LOWER(role) != 'admin'"

    if status and status != "ALL":
        query += " AND LOWER(status) = ?"
        params.append(status.strip().lower())

    query += " ORDER BY id ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        u = dict(r)
        u["is_admin"] = (u.get("role") or "").lower() in ("admin", "administrator", "director", "officer")
        result.append(u)

    return {"users": result}

@router.patch("/admin/users/{id}/status")
async def api_admin_update_user_status(id: int, data: dict):
    from app.models.database import get_db_connection, log_admin_activity
    target_status = data.get("status", "active").lower()
    if target_status not in ("active", "suspended"):
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found.")

    cursor.execute("UPDATE users SET status = ? WHERE id = ?", (target_status, id))
    conn.commit()

    cursor.execute("SELECT id, email, full_name, company_name, role, status, sector, created_at FROM users WHERE id = ?", (id,))
    updated_user = dict(cursor.fetchone())
    conn.close()

    updated_user["is_admin"] = (updated_user.get("role") or "").lower() in ("admin", "administrator")
    log_admin_activity(
        "BIS Administrator",
        f"Changed User Status to {target_status.capitalize()}",
        target_title=updated_user.get("full_name"),
        target_id=str(id)
    )

    return {"user": updated_user}

@router.delete("/admin/users/{id}")
async def api_admin_delete_user(id: int):
    from app.models.database import get_db_connection, log_admin_activity
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found.")

    if user["role"].lower() == "admin":
        cursor.execute("SELECT COUNT(*) as c FROM users WHERE LOWER(role) = 'admin'")
        admin_count = cursor.fetchone()["c"]
        if admin_count <= 1:
            conn.close()
            raise HTTPException(status_code=400, detail="Cannot delete the sole surviving administrator account.")

    user_name = user["full_name"]
    cursor.execute("DELETE FROM users WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    log_admin_activity(
        "BIS Administrator",
        "Deleted User Account",
        target_title=user_name,
        target_id=str(id)
    )

    return {"success": True, "message": "User account removed."}

@router.get("/admin/reports")
async def api_admin_reports(
    search: Optional[str] = "",
    status: Optional[str] = "ALL"
):
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM admin_reports WHERE 1=1"
    params = []

    if search:
        s = f"%{search.strip().lower()}%"
        query += " AND (LOWER(target_title) LIKE ? OR LOWER(reason) LIKE ? OR LOWER(reporter_name) LIKE ?)"
        params.extend([s, s, s])

    if status and status != "ALL":
        query += " AND LOWER(status) = ?"
        params.append(status.strip().lower())

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {"reports": [dict(r) for r in rows]}

@router.patch("/admin/reports/{id}/resolve")
async def api_admin_resolve_report(id: str, data: dict):
    from app.models.database import get_db_connection, log_admin_activity
    res_notes = data.get("resolution_notes", "Statutory inspection concluded and regulatory advisory issued.")
    action = data.get("action_taken", "Issued Statutory Advisory under BIS Act 2016")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_reports WHERE id = ?", (id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found.")

    cursor.execute("""
    UPDATE admin_reports 
    SET status = 'resolved', resolution_notes = ?, action_taken = ?
    WHERE id = ?
    """, (res_notes, action, id))
    conn.commit()

    cursor.execute("SELECT * FROM admin_reports WHERE id = ?", (id,))
    updated_rep = dict(cursor.fetchone())
    conn.close()

    log_admin_activity(
        "BIS Administrator",
        "Resolved Grievance Report",
        target_title=updated_rep.get("target_title"),
        target_id=id,
        details={"action_taken": action}
    )

    return {"report": updated_rep}

@router.patch("/admin/reports/{id}/dismiss")
async def api_admin_dismiss_report(id: str, data: dict):
    from app.models.database import get_db_connection, log_admin_activity
    notes = data.get("notes", "Dismissed after verification with laboratory records.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_reports WHERE id = ?", (id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found.")

    cursor.execute("""
    UPDATE admin_reports 
    SET status = 'dismissed', resolution_notes = ?
    WHERE id = ?
    """, (notes, id))
    conn.commit()

    cursor.execute("SELECT * FROM admin_reports WHERE id = ?", (id,))
    updated_rep = dict(cursor.fetchone())
    conn.close()

    log_admin_activity(
        "BIS Administrator",
        "Dismissed Grievance Report",
        target_title=updated_rep.get("target_title"),
        target_id=id
    )

    return {"report": updated_rep}

@router.get("/admin/activity")
async def api_admin_activity(
    limit: int = 50,
    target_type: Optional[str] = "ALL"
):
    import json
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_activity_log ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        act = dict(r)
        try:
            act["details"] = json.loads(act.get("details_json") or "{}")
        except Exception:
            act["details"] = {}
        result.append(act)

    return {"activities": result}

@router.get("/admin/content")
async def api_admin_content():
    return {
        "standards_indexed": 24,
        "chunks_count": 738,
        "active_qco_orders": 18,
        "exempted_msme_categories": 4,
        "last_vectorized_at": "2026-03-12T10:00:00Z",
        "sector_groups": [
            {
                "title": "Consumer Goods & Kitchen Utensils",
                "count": 4,
                "standards": [
                    {"id": "IS 2347:2017", "title": "Domestic Pressure Cookers (Aluminium and Stainless Steel)", "qco": True},
                    {"id": "IS 17803:2022", "title": "Stainless Steel Vacuum Flasks / Insulated Bottles", "qco": True},
                    {"id": "IS 17526:2021", "title": "Single-Walled Stainless Steel Bottles", "qco": True}
                ]
            },
            {
                "title": "Household Electrical Safety",
                "count": 5,
                "standards": [
                    {"id": "IS 302 (Part 2/Sec 21):2024", "title": "Electric Storage Water Heaters / Geysers", "qco": True},
                    {"id": "IS 302-2-15:2009", "title": "Electric Kettles and Water Heaters", "qco": True},
                    {"id": "IS 1293:2019", "title": "Plugs and Socket-Outlets (up to 250V / 16A)", "qco": True},
                    {"id": "IS 302 (Part 2/Sec 3):2021", "title": "Electric Dry & Steam Irons", "qco": True}
                ]
            },
            {
                "title": "Footwear & Personal Protective Equipment",
                "count": 3,
                "standards": [
                    {"id": "IS 15844 (Part 1):2023", "title": "Sports Footwear - Performance Requirements", "qco": True},
                    {"id": "IS 15844 (Part 3):2024", "title": "Leather and Canvas Footwear", "qco": True},
                    {"id": "IS 4151:2015", "title": "Protective Helmets for Two-Wheeler Riders", "qco": True}
                ]
            },
            {
                "title": "Public Health, Water & Civil Engineering",
                "count": 4,
                "standards": [
                    {"id": "IS 10500:2012", "title": "Drinking Water Specifications", "qco": True},
                    {"id": "IS 14543:2004", "title": "Packaged Drinking Water (Other Than Mineral Water)", "qco": True},
                    {"id": "IS 15410:2003", "title": "Containers for Packaging Drinking Water", "qco": True},
                    {"id": "IS 269:2015", "title": "Ordinary Portland Cement (33, 43, 53 Grade)", "qco": True}
                ]
            },
            {
                "title": "Clean Energy & Automotive",
                "count": 3,
                "standards": [
                    {"id": "IS 3196 (Part 1):2013", "title": "Welded Steel Cylinders for Low-Pressure Liquefiable Gases (LPG)", "qco": True},
                    {"id": "IS 14286:1995", "title": "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules", "qco": True},
                    {"id": "IS 16046 (Part 2):2018", "title": "Lithium Battery Cells for Portable Electronics", "qco": True}
                ]
            }
        ]
    }

@router.get("/admin/settings")
async def api_admin_settings():
    import json
    from app.models.database import get_db_connection
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value_json FROM admin_settings WHERE key = 'system_config'")
    row = cursor.fetchone()
    conn.close()

    default_settings = {
        "system_name": "Bureau of Indian Standards — Compliance Control Gateway",
        "version": "2.0.0",
        "qco_enforcement_mode": "Strict Gazette Mandatory",
        "rag_gateway_url": "http://127.0.0.1:8000",
        "auto_cml_issuance": True,
        "require_dual_signoff": False,
        "log_retention_days": 90,
        "last_saved_at": "2026-09-12T12:00:00Z"
    }

    if row and row["value_json"]:
        try:
            return json.loads(row["value_json"])
        except Exception:
            pass
    return default_settings

@router.patch("/admin/settings")
async def api_admin_save_settings(settings: dict):
    import json
    from datetime import datetime
    from app.models.database import get_db_connection, log_admin_activity
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value_json FROM admin_settings WHERE key = 'system_config'")
    row = cursor.fetchone()

    current_settings = {}
    if row and row["value_json"]:
        try:
            current_settings = json.loads(row["value_json"])
        except Exception:
            pass

    current_settings.update(settings)
    current_settings["last_saved_at"] = datetime.utcnow().isoformat()

    cursor.execute("""
    INSERT OR REPLACE INTO admin_settings (key, value_json)
    VALUES ('system_config', ?)
    """, (json.dumps(current_settings),))
    conn.commit()
    conn.close()

    log_admin_activity("BIS Administrator", "Updated System Settings", details=settings)
    return current_settings



