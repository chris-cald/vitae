import sqlite3
import json

DB_PATH = "./backend/test.db"


def patch_feedback_job_fit_ids():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT id, feedback FROM jobfit")
    rows = cur.fetchall()
    updated = 0
    for row in rows:
        job_fit_id = row["id"]
        feedback_json = row["feedback"]
        if not feedback_json:
            continue
        try:
            feedback = json.loads(feedback_json)
        except Exception:
            continue
        changed = False
        for item in feedback:
            if isinstance(item, dict) and "job_fit_id" not in item:
                item["job_fit_id"] = job_fit_id
                changed = True
        if changed:
            new_feedback_json = json.dumps(feedback, ensure_ascii=False)
            cur.execute(
                "UPDATE jobfit SET feedback = ? WHERE id = ?",
                (new_feedback_json, job_fit_id),
            )
            updated += 1
    conn.commit()
    conn.close()
    print(f"Patched {updated} jobfit records.")


if __name__ == "__main__":
    patch_feedback_job_fit_ids()
