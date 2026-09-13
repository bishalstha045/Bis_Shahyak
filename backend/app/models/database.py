import sqlite3
import os
import hashlib
import bcrypt
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "bis_sahayak.db")

def get_db_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'MSME Manufacturer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Saved Compliance Assessments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS compliance_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_name TEXT NOT NULL,
        standard_id TEXT NOT NULL,
        standard_title TEXT NOT NULL,
        readiness_score INTEGER NOT NULL,
        matrix_json TEXT NOT NULL,
        next_action TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    
    # Uploaded Documents Audit Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS uploaded_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_name TEXT NOT NULL,
        standard_id TEXT NOT NULL,
        supported_count INTEGER NOT NULL,
        missing_count INTEGER NOT NULL,
        readiness_score INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)
    
    # Query Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS query_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        query TEXT NOT NULL,
        mode TEXT,
        language TEXT,
        confidence REAL,
        processing_time REAL,
        status TEXT,
        response_preview TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Feedback Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        message_id TEXT NOT NULL,
        rating TEXT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Official Verified CML Licenses Registry
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verified_licenses (
        cml_number TEXT PRIMARY KEY,
        standard_id TEXT NOT NULL,
        standard_title TEXT NOT NULL,
        manufacturer_name TEXT NOT NULL,
        product_category TEXT NOT NULL,
        valid_up_to TEXT NOT NULL,
        status TEXT NOT NULL
    )
    """)

    # Multi-turn Chat Messages History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)")
    
    # Seed Demo User for testing
    cursor.execute("SELECT id FROM users WHERE email = 'demo.user@example.com'")
    if not cursor.fetchone():
        demo_pwd_hash = hash_password("TestingPass123!")
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, company_name, role)
        VALUES (?, ?, ?, ?, ?)
        """, ('demo.user@example.com', demo_pwd_hash, 'Ramesh Sharma', 'Shree Ram Industries (MSME)', 'Quality Lead'))
    
    # Users Table Migration for status and sector
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN sector TEXT DEFAULT 'MSME General'")
    except Exception:
        pass

    # Verification Submissions Table (Manufacturer Dossiers Queue)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verification_submissions (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        email TEXT,
        gstin TEXT,
        standard_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General Manufacturing',
        status TEXT NOT NULL DEFAULT 'pending',
        cml_license TEXT,
        rejection_reason TEXT,
        compliance_score INTEGER DEFAULT 85,
        documents_json TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Administrative Grievance / Market Surveillance Reports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_reports (
        id TEXT PRIMARY KEY,
        target_title TEXT NOT NULL,
        target_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        reporter_name TEXT NOT NULL,
        reporter_email TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        resolution_notes TEXT,
        action_taken TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Administrative Audit Activity Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_activity_log (
        id TEXT PRIMARY KEY,
        admin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        target_title TEXT,
        target_id TEXT,
        details_json TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Administrative System Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL
    )
    """)

    # Statutory & Enterprise Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        badge TEXT NOT NULL,
        title TEXT NOT NULL,
        authority TEXT NOT NULL DEFAULT 'Bureau of Indian Standards',
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        impact TEXT,
        action_primary_json TEXT,
        action_secondary_json TEXT,
        badge_class TEXT,
        node_color TEXT,
        line_color TEXT,
        unread INTEGER DEFAULT 1,
        user_email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed Official BIS Verified Licenses
    seed_licenses = [
        ("CM/L-7128394", "IS 302-2-15:2009", "Safety of Household and Similar Electrical Appliances - Particular Requirements for Electric Kettles", "Bajaj Electricals Ltd.", "Kitchen Appliances", "2028-12-31", "Active"),
        ("CM/L-8291042", "IS 3196 (Part 1):2013", "Welded Low Carbon Steel Cylinders for Low Pressure Liquefiable Gases", "Bharat Petroleum Gas Bottling Plant", "Pressure Vessels", "2027-06-30", "Active"),
        ("CM/L-9043211", "IS 14543:2004", "Packaged Drinking Water (Other Than Packaged Natural Mineral Water)", "Bisleri International Pvt Ltd", "Beverages & Packaged Water", "2029-03-31", "Active"),
        ("CM/L-6321908", "IS 9873 (Part 1):2019", "Safety Aspects Related to Mechanical and Physical Properties for Toys", "Funskool India Ltd.", "Toys & Children Goods", "2028-09-15", "Active"),
        ("CM/L-5412980", "IS 15410:2003", "Containers for Packaging of Natural Mineral Water and Packaged Drinking Water", "Ester Industries Ltd.", "Plastics & Packaging", "2027-11-20", "Active"),
        ("CM/L-3419082", "IS 16046 (Part 2):2018", "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes (Lithium Systems)", "Exide Industries Ltd.", "Electronics & Energy", "2028-05-10", "Active"),
        ("CM/L-2198471", "IS 1293:2019", "Plugs and Socket-Outlets of Rated Voltage up to and Including 250V and Rated Current up to 16A", "Havells India Ltd.", "Electrical Accessories", "2028-01-31", "Active"),
        ("CM/L-1092837", "IS 269:2015", "Ordinary Portland Cement, 33 Grade, 43 Grade and 53 Grade - Specification", "UltraTech Cement Ltd.", "Civil Engineering & Building Materials", "2029-12-31", "Active"),
        ("CM/L-4491028", "IS 17803:2022", "Stainless Steel Vacuum Flasks / Insulated Water Bottles - Specification", "Milton / Hamilton Housewares Pvt Ltd", "Consumer Utensils", "2028-10-31", "Active"),
        ("CM/L-3382910", "IS 4151:2015", "Protective Helmets for Two Wheeler Riders - Specification", "Steelbird Hi-Tech India Ltd.", "Automotive Safety", "2027-08-31", "Active"),
        ("CM/L-5519203", "IS 14286:1995", "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules", "Tata Power Solar Systems Ltd.", "Solar & Renewable Energy", "2029-06-30", "Active")
    ]
    
    cursor.executemany("""
    INSERT OR REPLACE INTO verified_licenses (cml_number, standard_id, standard_title, manufacturer_name, product_category, valid_up_to, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, seed_licenses)

    # Seed Default Administrator Accounts
    admin_pwd_hash = hash_password("Admin@123")
    cursor.execute("SELECT id FROM users WHERE email = 'admin@admin.com'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, company_name, role, status, sector)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ('admin@admin.com', admin_pwd_hash, 'BIS Administrator', 'Bureau of Indian Standards HQ', 'Admin', 'active', 'Regulatory Directorate'))
    else:
        cursor.execute("UPDATE users SET password_hash = ?, role = 'Admin', status = 'active' WHERE email = 'admin@admin.com'", (admin_pwd_hash,))

    cursor.execute("SELECT id FROM users WHERE email = 'admin@bis.gov.in'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, company_name, role, status, sector)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ('admin@bis.gov.in', admin_pwd_hash, 'Directorate Officer', 'BIS Directorate General', 'Admin', 'active', 'Regulatory Directorate'))
    else:
        cursor.execute("UPDATE users SET password_hash = ?, role = 'Admin', status = 'active' WHERE email = 'admin@bis.gov.in'", (admin_pwd_hash,))

    # Seed Sample Manufacturers for realistic Admin Users View
    sample_users = [
        ('surya.flame@enterprise.in', 'TestingPass123!', 'Amit Verma', 'Surya Flame Kitchenware Ltd.', 'MSME Manufacturer', 'active', 'Domestic Utensils'),
        ('bajaj.electricals@bajaj.com', 'TestingPass123!', 'Sanjay Bajaj', 'Bajaj Electricals Ltd.', 'Quality Lead', 'active', 'Household Electricals'),
        ('prestige.cookers@ttk.in', 'TestingPass123!', 'K. Venkat', 'TTK Prestige Industries', 'MSME Manufacturer', 'active', 'Pressure Cookers'),
        ('milton.flasks@hamilton.in', 'TestingPass123!', 'Rohit Hamilton', 'Milton Consumer Goods', 'Compliance Officer', 'active', 'Insulated Ware'),
        ('steelbird.helmets@steelbird.in', 'TestingPass123!', 'Rajeev Kapur', 'Steelbird Hi-Tech India', 'Quality Lead', 'suspended', 'Automotive Safety')
    ]
    for u_email, u_pwd, u_name, u_company, u_role, u_status, u_sector in sample_users:
        cursor.execute("SELECT id FROM users WHERE email = ?", (u_email,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, company_name, role, status, sector)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (u_email, hash_password(u_pwd), u_name, u_company, u_role, u_status, u_sector))

    # Seed Initial Verification Submissions (Dossiers)
    seed_submissions = [
        ("sub-101", "Prestige Home Appliances Ltd.", "Suresh Patel", "suresh.patel@prestige.com", "GSTIN27AABCP1234F1Z5", "IS 2347:2017", "Domestic Pressure Cooker (Aluminium)", "Consumer Goods", "pending", None, None, 92, None, "2026-03-01 10:00:00"),
        ("sub-102", "Surya Flame Kitchenware", "Amit Verma", "amit.verma@suryaflame.in", "GSTIN07AABCS5678G1Z2", "IS 17803:2022", "Insulated Stainless Steel Vacuum Flask", "Consumer Utensils", "under_review", None, None, 88, None, "2026-03-05 14:30:00"),
        ("sub-103", "Havells India Electronics", "Rajesh Kumar", "rajesh.k@havells.com", "GSTIN06AABCH9012K1Z9", "IS 1293:2019", "3-Pin Plugs and Socket-Outlets (16A)", "Electrical Safety", "verified", "CM/L-2198471", None, 96, None, "2026-02-15 09:15:00"),
        ("sub-104", "Falcon Safety Gear Ltd.", "Neha Sharma", "neha.sharma@falconsafety.in", "GSTIN29AABCF3456L1Z4", "IS 4151:2015", "Motorcycle Protective Helmets", "Automotive Safety", "rejected", None, "Impact attenuation test logs failed clause 7.2 threshold under NABL laboratory audit.", 54, None, "2026-02-20 11:45:00"),
        ("sub-105", "Bisleri Natural Springs Pvt Ltd", "Anand Rao", "anand.rao@bisleri.in", "GSTIN27AABCB9876M1Z1", "IS 14543:2004", "Packaged Drinking Water (20L Jar)", "Beverages & Water", "pending", None, None, 85, None, "2026-03-10 16:20:00")
    ]
    for s_id, s_comp, s_app, s_em, s_gst, s_std, s_prod, s_cat, s_stat, s_lic, s_rej, s_score, s_docs, s_date in seed_submissions:
        cursor.execute("SELECT id FROM verification_submissions WHERE id = ?", (s_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO verification_submissions (id, company_name, applicant_name, email, gstin, standard_id, product_name, category, status, cml_license, rejection_reason, compliance_score, documents_json, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (s_id, s_comp, s_app, s_em, s_gst, s_std, s_prod, s_cat, s_stat, s_lic, s_rej, s_score, s_docs, s_date))

    # Seed Initial Grievance & Surveillance Reports
    seed_reports = [
        ("rep-201", "Counterfeit ISI Mark on Domestic Gas Stoves", "Market Surveillance", "Uncertified gas stoves bearing fake CM/L-7128394 sold on local markets without BIS laboratory conformance.", "Vikram Singhania", "vikram.s@consumer-forum.org", "high", "open", None, None, "2026-03-08 12:00:00"),
        ("rep-202", "Misleading QCO Exemption Claim", "E-Commerce Goods", "Online retail portal claims mandatory QCO order exemption for imported 1000W electric kettles.", "Priya Mehta", "priya.m@quality-watch.in", "medium", "under_review", None, None, "2026-03-09 15:30:00"),
        ("rep-203", "Substandard Pressure Cooker Gasket Material", "Manufacturer Audit", "Gasket rubber failed food-grade migration and thermal resilience tests under IS 2347 clause 6.4.", "R. K. Verma", "rk.verma@bis-inspector.gov.in", "high", "resolved", "Statutory recall notice issued under BIS Act 2016 section 18.", "Issued Statutory Recall Notice", "2026-02-28 16:00:00")
    ]
    for r_id, r_title, r_type, r_reason, r_name, r_email, r_sev, r_stat, r_notes, r_act, r_date in seed_reports:
        cursor.execute("SELECT id FROM admin_reports WHERE id = ?", (r_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO admin_reports (id, target_title, target_type, reason, reporter_name, reporter_email, severity, status, resolution_notes, action_taken, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (r_id, r_title, r_type, r_reason, r_name, r_email, r_sev, r_stat, r_notes, r_act, r_date))

    # Seed Initial Admin Activity Log
    import json
    seed_activities = [
        ("act-1", "BIS Administrator", "Approved Verification Dossier", "Havells India Electronics", "sub-103", json.dumps({"cml_license": "CM/L-2198471"}), "2026-02-15 10:00:00"),
        ("act-2", "BIS Administrator", "Resolved Grievance Report", "Substandard Pressure Cooker Gasket Material", "rep-203", json.dumps({"action_taken": "Issued Statutory Recall Notice"}), "2026-02-28 16:30:00"),
        ("act-3", "Directorate Officer", "Rejected Verification Dossier", "Falcon Safety Gear Ltd.", "sub-104", json.dumps({"rejection_reason": "Impact attenuation test failed clause 7.2"}), "2026-02-20 12:00:00"),
        ("act-4", "BIS Administrator", "System Parameters Initialized", "QCO Enforcement Engine v2.0", "sys-init", json.dumps({"mode": "Strict Gazette Mandatory"}), "2026-01-01 00:00:00")
    ]
    for a_id, a_admin, a_act, a_title, a_tid, a_det, a_ts in seed_activities:
        cursor.execute("SELECT id FROM admin_activity_log WHERE id = ?", (a_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO admin_activity_log (id, admin_name, action, target_title, target_id, details_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (a_id, a_admin, a_act, a_title, a_tid, a_det, a_ts))

    # Seed Default System Settings
    cursor.execute("SELECT key FROM admin_settings WHERE key = 'system_config'")
    if not cursor.fetchone():
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
    # Seed Initial Statutory Notifications
    seed_notifications = [
        (
            "notif-1",
            "qco",
            "GAZETTE MANDATE",
            "Ministry of Steel notifies Phase-II Quality Control Order for Stainless Steel Utensils",
            "Ministry of Steel / BIS Gazette",
            "12 Mar 2026",
            "Under S.O. 1245(E), all domestic pressure cookers and vacuum flasks must comply with IS 2347 and IS 17803. Non-certified stock prohibited from sale or import.",
            "Mandatory ISI Mark Certification Required before 01 July 2026",
            json.dumps({"label": "Check My Product Conformance →", "target": "compliance"}),
            json.dumps({"label": "Ask AI About Gazette Impact", "query": "What are the specific penalties and compliance steps under Stainless Steel QCO Order 2026?"}),
            "bg-amber-50 text-amber-700 border-amber-200",
            "bg-amber-500",
            "border-amber-200",
            1,
            None
        ),
        (
            "notif-2",
            "amendments",
            "STANDARD AMENDMENT",
            "IS 302 (Part 2/Sec 21):2024 Amendment 1 published: Enhanced Pressure Relief Valves",
            "Electrotechnical Division (ETD-32)",
            "08 Mar 2026",
            "Clause 22.101 updated: Pressure relief valves on closed storage electric water heaters (geysers) must feature dual independent spring resets to prevent thermal rupture.",
            "Clause 22.101 test audit update required for all water heater licensees",
            json.dumps({"label": "Compare Clauses & Changes →", "target": "standards"}),
            json.dumps({"label": "View Clause Details in Assistant", "query": "Explain Amendment 1 to IS 302-2-21:2024 regarding pressure relief valves"}),
            "bg-blue-50 text-blue-700 border-blue-200",
            "bg-blue-500",
            "border-blue-200",
            1,
            None
        ),
        (
            "notif-3",
            "labs",
            "LAB EMPANELMENT",
            "National Test House (Western Region, Mumbai) Empanelled for Vacuum Flask Testing",
            "Central Laboratory Directorate",
            "02 Mar 2026",
            "NTH Mumbai has received NABL ISO/IEC 17025 accreditation for thermal insulation retention and overall migration tests under IS 17803:2022. Turnaround time reduced to 5 working days.",
            "Accredited Lab Capacity Available for MSME Manufacturers",
            json.dumps({"label": "Audit Test Reports via Document Analyzer →", "target": "document-analyzer"}),
            None,
            "bg-purple-50 text-purple-700 border-purple-200",
            "bg-purple-500",
            "border-purple-200",
            0,
            None
        ),
        (
            "notif-4",
            "impact",
            "QCO DEADLINE ALERT",
            "Mandatory Deadline Alert: Toys Safety Order enforcement window closing in 45 days",
            "DPIIT / Quality Control Directorate",
            "26 Feb 2026",
            "All non-electric and electric toys under IS 9873 (Parts 1, 2, 3) must bear standard ISI mark with valid CM/L license. Uncertified stock liable to seizure under Section 18 of BIS Act 2016.",
            "Immediate Factory Audit & Lab Test Certificate Submission Required",
            json.dumps({"label": "Submit Verification Dossier →", "target": "verification"}),
            json.dumps({"label": "Ask AI about MSME Toy Exemption Rules", "query": "Are micro enterprises exempt from toy safety testing fees under BIS?"}),
            "bg-rose-50 text-rose-700 border-rose-200",
            "bg-rose-500",
            "border-rose-200",
            1,
            None
        )
    ]
    for n_id, n_type, n_badge, n_title, n_auth, n_date, n_desc, n_imp, n_pact, n_sact, n_bcls, n_ncol, n_lcol, n_unr, n_user in seed_notifications:
        cursor.execute("SELECT id FROM notifications WHERE id = ?", (n_id,))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO notifications (id, type, badge, title, authority, date, description, impact, action_primary_json, action_secondary_json, badge_class, node_color, line_color, unread, user_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (n_id, n_type, n_badge, n_title, n_auth, n_date, n_desc, n_imp, n_pact, n_sact, n_bcls, n_ncol, n_lcol, n_unr, n_user))

    conn.commit()
    conn.close()

def save_chat_message(session_id: str, role: str, content: str):
    """Save a chat message to session history."""
    if not session_id or not content:
        return
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)",
            (session_id, role, content)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Chat History Save Note] {e}")

def get_chat_history(session_id: str, limit: int = 8) -> list:
    """Retrieve recent conversation history for multi-turn chat."""
    if not session_id:
        return []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
            (session_id, limit)
        )
        rows = cursor.fetchall()
        conn.close()
    except Exception as e:
        print(f"[Chat History Fetch Note] {e}")
        return []

def log_admin_activity(admin_name: str, action: str, target_title: str = None, target_id: str = None, details: dict = None):
    """Record an audit trail activity performed by an administrator."""
    import json
    import uuid
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        act_id = f"act-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO admin_activity_log (id, admin_name, action, target_title, target_id, details_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (act_id, admin_name or "BIS Administrator", action, target_title, target_id, json.dumps(details or {}), datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()
        return act_id
    except Exception as e:
        print(f"[Admin Activity Log Note] {e}")
        return None

# Initialize tables
init_db()

