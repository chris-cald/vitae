import os
import sqlite3

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
DB_PATH = os.path.join(os.path.dirname(__file__), "test.db")

# Get all referenced file paths from the resume table
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("SELECT file_path FROM resume;")
referenced_files = set(os.path.basename(row[0]) for row in cursor.fetchall())
conn.close()

# List all files in uploads directory
all_files = set(os.listdir(UPLOADS_DIR))

# Find orphaned files
orphaned_files = all_files - referenced_files

# Delete orphaned files
for filename in orphaned_files:
    file_path = os.path.join(UPLOADS_DIR, filename)
    try:
        os.remove(file_path)
        print(f"Deleted orphaned file: {filename}")
    except Exception as e:
        print(f"Failed to delete {filename}: {e}")

if not orphaned_files:
    print("No orphaned files found.")
