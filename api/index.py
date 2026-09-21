from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, students, timetable, attendance, notifications, analytics

app = FastAPI(title="College Attendance Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(notifications.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
