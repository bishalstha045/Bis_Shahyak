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
    
    # Seed Demo User: demo@msme.gov.in / Demo@1234
    cursor.execute("SELECT id FROM users WHERE email = 'demo@msme.gov.in'")
    if not cursor.fetchone():
        demo_pwd_hash = hash_password("Demo@1234")
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, company_name, role)
        VALUES (?, ?, ?, ?, ?)
        """, ('demo@msme.gov.in', demo_pwd_hash, 'Ramesh Sharma', 'Shree Ram Industries (MSME)', 'Quality Lead'))
    
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
    
    conn.commit()
    conn.close()

# Initialize tables
init_db()
