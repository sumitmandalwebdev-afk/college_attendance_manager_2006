from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class StudentIn(BaseModel):
    roll_number: str
    name: str
    department: str
    year: int
    email: Optional[str] = None
    phone: Optional[str] = None


class TimetableIn(BaseModel):
    department: str
    year: int
    day_of_week: int
    start_time: str
    end_time: str
    subject: str
    teacher: str
    room: Optional[str] = None


class AttendanceMarkIn(BaseModel):
    qr_code: str
    timetable_id: Optional[str] = None
    status: Optional[str] = "present"


class AttendanceManualIn(BaseModel):
    student_id: str
    timetable_id: Optional[str] = None
    status: str = "present"
    date: Optional[str] = None


class NotificationIn(BaseModel):
    title: str
    message: str
    type: Optional[str] = "info"
