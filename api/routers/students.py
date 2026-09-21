import uuid
import secrets
from fastapi import APIRouter, Depends, HTTPException
from api.models import StudentIn
from api.db import fetch_all, fetch_one, execute
from api.auth import require_admin

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("")
def list_students(department: str = None, year: int = None, search: str = None, current=Depends(require_admin)):
    query = "SELECT * FROM students WHERE 1=1"
    params = []
    if department:
        query += " AND department = %s"
        params.append(department)
    if year:
        query += " AND year = %s"
        params.append(year)
    if search:
        query += " AND (name ILIKE %s OR roll_number ILIKE %s)"
        params += [f"%{search}%", f"%{search}%"]
    query += " ORDER BY name ASC"
    return fetch_all(query, tuple(params))


@router.post("")
def create_student(payload: StudentIn, current=Depends(require_admin)):
    existing = fetch_one("SELECT id FROM students WHERE roll_number = %s", (payload.roll_number,))
    if existing:
        raise HTTPException(status_code=409, detail="A student with this roll number already exists")
    new_id = str(uuid.uuid4())
    qr_code = f"STU-{payload.roll_number}-{secrets.token_hex(4)}"
    execute(
        """INSERT INTO students (id, roll_number, name, department, year, email, phone, qr_code)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (new_id, payload.roll_number, payload.name, payload.department, payload.year,
         payload.email, payload.phone, qr_code),
    )
    return fetch_one("SELECT * FROM students WHERE id = %s", (new_id,))


@router.put("/{student_id}")
def update_student(student_id: str, payload: StudentIn, current=Depends(require_admin)):
    existing = fetch_one("SELECT * FROM students WHERE id = %s", (student_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    execute(
        """UPDATE students SET roll_number=%s, name=%s, department=%s, year=%s, email=%s, phone=%s
           WHERE id=%s""",
        (payload.roll_number, payload.name, payload.department, payload.year,
         payload.email, payload.phone, student_id),
    )
    return fetch_one("SELECT * FROM students WHERE id = %s", (student_id,))


@router.delete("/{student_id}")
def delete_student(student_id: str, current=Depends(require_admin)):
    existing = fetch_one("SELECT id FROM students WHERE id = %s", (student_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")
    execute("DELETE FROM students WHERE id = %s", (student_id,))
    return {"deleted": True}
