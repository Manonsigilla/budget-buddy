import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='bank_user',
        password='bank_password_dev',
        database='banking_app',
        port=3307
    )
    cursor = conn.cursor()
    print("Fixing users table ENUM...")
    cursor.execute("ALTER TABLE users MODIFY COLUMN account_type ENUM('user', 'admin', 'banker') DEFAULT 'user';")
    print("Ensuring banker_clients table exists...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS banker_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        banker_id INT NOT NULL,
        client_id INT NOT NULL UNIQUE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (banker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_banker (banker_id)
    );
    """)
    conn.commit()
    print("Schema fixed successfully!")
    conn.close()
except Exception as e:
    print("ERROR:", e)
