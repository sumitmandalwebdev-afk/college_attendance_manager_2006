import uuid
from fastapi import APIRouter, Depends, HTTPException
from api.models import NotificationIn
from api.db import fetch_all, fetch_one, execute
from api.auth import require_admin

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(current=Depends(require_admin)):
    return fetch_all("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100")


@router.post("")
def create_notification(payload: NotificationIn, current=Depends(require_admin)):
    new_id = str(uuid.uuid4())
    execute(
        "INSERT INTO notifications (id, title, message, type) VALUES (%s, %s, %s, %s)",
        (new_id, payload.title, payload.message, payload.type),
    )
    return fetch_one("SELECT * FROM notifications WHERE id = %s", (new_id,))


@router.patch("/{notification_id}/read")
def mark_read(notification_id: str, current=Depends(require_admin)):
    existing = fetch_one("SELECT id FROM notifications WHERE id = %s", (notification_id,))
    if not existing:
        raise HTTPException(status_code=404, detail="Notification not found")
    execute("UPDATE notifications SET is_read = true WHERE id = %s", (notification_id,))
    return {"updated": True}


@router.delete("/{notification_id}")
def delete_notification(notification_id: str, current=Depends(require_admin)):
    execute("DELETE FROM notifications WHERE id = %s", (notification_id,))
    return {"deleted": True}
