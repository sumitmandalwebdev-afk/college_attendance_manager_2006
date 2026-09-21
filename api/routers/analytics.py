from fastapi import APIRouter, Depends
from api.db import fetch_all, fetch_one
from api.auth import require_admin

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def summary(current=Depends(require_admin)):
    total_students = fetch_one("SELECT COUNT(*) AS count FROM students")["count"]
    today_present = fetch_one(
        "SELECT COUNT(DISTINCT student_id) AS count FROM attendance WHERE date = CURRENT_DATE AND status='present'"
    )["count"]
    total_classes = fetch_one("SELECT COUNT(*) AS count FROM timetable")["count"]
    unread_notifications = fetch_one("SELECT COUNT(*) AS count FROM notifications WHERE is_read = false")["count"]

    last_7_days = fetch_all(
        """
        SELECT date::text AS date,
               COUNT(*) FILTER (WHERE status = 'present') AS present,
               COUNT(*) FILTER (WHERE status = 'absent') AS absent,
               COUNT(*) FILTER (WHERE status = 'late') AS late
        FROM attendance
        WHERE date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY date
        ORDER BY date ASC
        """
    )

    by_department = fetch_all(
        """
        SELECT s.department,
               COUNT(*) FILTER (WHERE a.status = 'present') AS present,
               COUNT(*) AS total
        FROM students s
        LEFT JOIN attendance a ON a.student_id = s.id AND a.date = CURRENT_DATE
        GROUP BY s.department
        ORDER BY s.department
        """
    )

    top_students = fetch_all(
        """
        SELECT s.id, s.name, s.roll_number, s.department,
               COUNT(*) FILTER (WHERE a.status = 'present') AS present_count
        FROM students s
        JOIN attendance a ON a.student_id = s.id
        GROUP BY s.id, s.name, s.roll_number, s.department
        ORDER BY present_count DESC
        LIMIT 5
        """
    )

    return {
        "total_students": total_students,
        "today_present": today_present,
        "total_classes": total_classes,
        "unread_notifications": unread_notifications,
        "last_7_days": last_7_days,
        "by_department": by_department,
        "top_students": top_students,
    }
