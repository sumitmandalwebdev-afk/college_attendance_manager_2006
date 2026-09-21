import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from api.models import AttendanceMarkIn, AttendanceManualIn
from api.db import fetch_all, fetch_one, execute
from api.auth import require_admin

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/scan")
def mark_via_qr(payload: AttendanceMarkIn, current=Depends(require_admin)):
    student = fetch_one("SELECT * FROM students WHERE qr_code = %s", (payload.qr_code,))
    if not student:
        raise HTTPException(status_code=404, detail="No student matches this QR code")

    today = datetime.date.today().isoformat()
    already = fetch_one(
        "SELECT id FROM attendance WHERE student_id=%s AND date=%s AND timetable_id IS NOT DISTINCT FROM %s",
        (student["id"], today, payload.timetable_id),
    )
    if already:
        return {"status": "duplicate", "student": student, "message": f"{student['name']} was already marked today"}

    new_id = str(uuid.uuid4())
    execute(
        """INSERT INTO attendance (id, student_id, timetable_id, date, status, marked_via, marked_by)
           VALUES (%s, %s, %s, %s, %s, 'qr', %s)""",
        (new_id, student["id"], payload.timetable_id, today, payload.status or "present", current["sub"]),
    )
    return {"status": "marked", "student": student}


@router.post("/manual")
def mark_manual(payload: AttendanceManualIn, current=Depends(require_admin)):
    student = fetch_one("SELECT * FROM students WHERE id = %s", (payload.student_id,))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    date = payload.date or datetime.date.today().isoformat()

    existing = fetch_one(
        "SELECT id FROM attendance WHERE student_id=%s AND date=%s AND timetable_id IS NOT DISTINCT FROM %s",
        (payload.student_id, date, payload.timetable_id),
    )
    if existing:
        execute(
            "UPDATE attendance SET status=%s, marked_via='manual', marked_by=%s WHERE id=%s",
            (payload.status, current["sub"], existing["id"]),
        )
        return fetch_one("SELECT * FROM attendance WHERE id = %s", (existing["id"],))

    new_id = str(uuid.uuid4())
    execute(
        """INSERT INTO attendance (id, student_id, timetable_id, date, status, marked_via, marked_by)
           VALUES (%s, %s, %s, %s, %s, 'manual', %s)""",
        (new_id, payload.student_id, payload.timetable_id, date, payload.status, current["sub"]),
    )
    return fetch_one("SELECT * FROM attendance WHERE id = %s", (new_id,))


@router.get("")
def list_attendance(date: str = None, student_id: str = None, department: str = None, current=Depends(require_admin)):
    query = """
        SELECT a.*, s.name AS student_name, s.roll_number, s.department, s.year
        FROM attendance a JOIN students s ON s.id = a.student_id
        WHERE 1=1
    """
    params = []
    if date:
        query += " AND a.date = %s"
        params.append(date)
    if student_id:
        query += " AND a.student_id = %s"
        params.append(student_id)
    if department:
        query += " AND s.department = %s"
        params.append(department)
    query += " ORDER BY a.created_at DESC LIMIT 200"
    return fetch_all(query, tuple(params))
