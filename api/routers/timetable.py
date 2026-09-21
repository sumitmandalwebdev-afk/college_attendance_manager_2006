import uuid
from fastapi import APIRouter, Depends, HTTPException
from api.models import TimetableIn
from api.db import fetch_all, fetch_one, execute
from api.auth import require_admin

router = APIRouter(prefix="/api/timetable", tags=["timetable"])


@router.get("")
def list_timetable(department: str = None, year: int = None, current=Depends(require_admin)):
    query = "SELECT * FROM timetable WHERE 1=1"
    params = []
    if department:
        query += " AND department = %s"
        params.append(department)
    if year:
        query += " AND year = %s"
        params.append(year)
    query += " ORDER BY day_of_week ASC, start_time ASC"
    return fetch_all(query, tuple(params))


@router.post("")
def create_slot(payload: TimetableIn, current=Depends(require_admin)):
    new_id = str(uuid.uuid4())
    execute(
        """INSERT INTO timetable (id, department, year, day_of_week, start_time, end_time, subject, teacher, room)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (new_id, payload.department, payload.year, payload.day_of_week, payload.start_time,
         payload.end_time, payload.subject, payload.teacher, payload.room),
    )
    return fetch_one("SELECT * FROM timetable WHERE id = %s", (new_id,))


@router.delete("/{slot_id}")
def delete_slot(slot_id: str, current=Depends(require_admin)):
    existing = fetch_one("SELECT id FROM timetable WHERE id = %s", (slot_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Timetable slot not found")
    execute("DELETE FROM timetable WHERE id = %s", (slot_id,))
    return {"deleted": True}
