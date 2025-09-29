# init_db.py
import sqlite3
import os

def create_databases():
    db_dir = os.path.dirname(os.path.abspath(__file__))
    main_db = os.path.join(db_dir, "frostrise.db")
    logs_db = os.path.join(db_dir, "frostrise_logs.db")

    conn = sqlite3.connect(main_db)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        theme TEXT DEFAULT 'system',
        language TEXT DEFAULT 'ru'
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS constants (
        name TEXT PRIMARY KEY,
        value REAL NOT NULL,
        unit TEXT,
        description TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS formulas (
        formula_name TEXT PRIMARY KEY,
        formula_text TEXT NOT NULL,
        description TEXT,
        category TEXT
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS soils (
        code TEXT PRIMARY KEY,
        name TEXT,
        rho_d REAL,
        w REAL,
        wp REAL,
        ip REAL,
        ww REAL,
        lambda_f REAL,
        c_f REAL,
        t0 REAL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        igu_code TEXT NOT NULL,
        material_type TEXT,
        thickness_cm REAL,
        rho_d REAL,
        w REAL,
        lambda_f REAL,
        c_f REAL,
        eta_f REAL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS calculation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        soil_code TEXT NOT NULL,
        tcp_deg_C REAL,
        ugw_m REAL,
        load_tn_per_m2 REAL,
        k2 REAL,
        freezing_depth_cm REAL,
        heave_deformation_cm REAL,
        puffiness_degree TEXT,
        risk_assessment TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    c.execute("INSERT OR IGNORE INTO settings (id, theme, language) VALUES (1, 'system', 'ru')")
    conn.commit()
    conn.close()

    conn = sqlite3.connect(logs_db)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL CHECK(level IN ('DEBUG','INFO','WARNING','ERROR','CRITICAL')),
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT,
        stack_trace TEXT
    )''')
    conn.commit()
    conn.close()
    print("✅ БД созданы")