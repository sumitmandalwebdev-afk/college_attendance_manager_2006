# 🎓 College Attendance Manager

A web-based college attendance management system designed to simplify student attendance tracking, QR-based attendance, timetable management, analytics, and administrative operations.

The project is built from the ground up using **HTML, CSS, JavaScript, Python, FastAPI, and SQL**, without frontend frameworks or an ORM.

## 🌐 Live Demo

**Live Application:**
https://college-attendance-manager-opdarksoumya-6877s-projects.vercel.app/

**API Health Check:**
`/api/health`

---

## ✨ Features

* 🔐 Admin authentication with JWT sessions
* 👨‍🎓 Student management
* 📋 Attendance management
* 📱 QR-based attendance
* 📅 Timetable management
* 📊 Attendance analytics
* 🔔 Notifications
* 🗃️ PostgreSQL database integration
* 🔒 Password hashing with bcrypt
* ⚡ FastAPI backend
* 📱 Responsive web interface
* 🌐 Vercel deployment

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

The frontend is built using plain HTML, CSS, and JavaScript without React, Vue, Angular, or other frontend frameworks.

### Backend

* Python
* FastAPI
* Uvicorn

### Database

* PostgreSQL
* Supabase
* Raw SQL
* psycopg2

### Authentication & Security

* JWT-based sessions
* bcrypt password hashing
* Environment variables for sensitive configuration

### Deployment

* Vercel

---

## 🏗️ Architecture

```text
                    USER
                     │
                     ▼
              HTML / CSS / JS
                     │
                     ▼
                FastAPI API
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
     Authentication        Application Logic
          │                     │
          └──────────┬──────────┘
                     ▼
               PostgreSQL
                 / Supabase
                     │
                     ▼
             Attendance Data
```

---

## 📂 Project Structure

```text
college_attendance_manager_2006/
│
├── api/
│   └── FastAPI backend
│
├── public/
│   ├── login
│   ├── dashboard
│   ├── students
│   ├── attendance
│   ├── QR scanning
│   ├── timetable
│   ├── analytics
│   └── notifications
│
├── sql/
│   └── schema.sql
│
├── requirements.txt
├── vercel.json
└── README.md
```

---

## 🔐 Authentication

The application uses real administrator accounts stored in the database.

Passwords are stored using **bcrypt password hashing**, while authenticated sessions use JWT-based authentication.

Sensitive configuration such as:

```text
DATABASE_URL
JWT_SECRET
```

should be provided through environment variables rather than hard-coded into the application.

---

## 📊 Attendance Management

The system provides functionality for managing attendance records and viewing attendance-related information.

The QR-based workflow is designed to make attendance marking faster and reduce manual data entry.

---

## 📱 QR-Based Attendance

The application includes QR-based attendance functionality.

Basic workflow:

```text
Student / Attendance QR
        ↓
QR Scan
        ↓
Attendance Request
        ↓
FastAPI Backend
        ↓
Database
        ↓
Attendance Record
```

---

## 📅 Timetable

The application includes timetable functionality for organizing class schedules and providing timetable information through the web interface.

---

## 📈 Analytics

Attendance information can be presented through the dashboard and analytics section to make attendance patterns easier to understand.

---

## 🔔 Notifications

The application includes a notification section for displaying relevant attendance or system-related information.

---

## 🗄️ Database

The project uses **PostgreSQL through Supabase**.

The database schema is maintained in:

```text
sql/schema.sql
```

The backend communicates with PostgreSQL using raw SQL through `psycopg2`, without using an ORM.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Python 3.x
* PostgreSQL / Supabase database
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/sumitmandalwebdev-afk/college_attendance_manager_2006.git
```

```bash
cd college_attendance_manager_2006
```

---

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Set the required environment variables:

```text
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
```

Do not commit real credentials or secrets to GitHub.

---

### 4. Start the Backend

```bash
uvicorn api.index:app --reload
```

The FastAPI backend will run locally.

---

### 5. Serve the Frontend

From the project directory:

```bash
python -m http.server 5500 --directory public
```

Then open:

```text
http://localhost:5500
```

---

## 🔄 Application Flow

```text
Login
  ↓
Authentication
  ↓
Dashboard
  ↓
┌───────────────────────────────┐
│ Students                      │
│ Attendance                    │
│ QR Attendance                 │
│ Timetable                     │
│ Analytics                     │
│ Notifications                 │
└───────────────────────────────┘
  ↓
PostgreSQL Database
```

---

## 🔒 Security Considerations

The project follows basic security practices including:

* Password hashing using bcrypt
* JWT-based authentication
* Environment variables for secrets
* Server-side database operations
* API-based access to application data

Never commit:

```text
.env
database passwords
JWT secrets
API keys
private credentials
```

to the repository.

---

## 🎯 Project Goals

The main goals of College Attendance Manager are to:

* Reduce manual attendance management
* Provide a centralized attendance system
* Simplify QR-based attendance
* Make attendance information easier to access
* Provide useful attendance analytics
* Organize timetable and notification information

---

## 🔮 Future Improvements

Possible future improvements include:

* Student and faculty-specific accounts
* Role-based access control
* Attendance percentage alerts
* Automated low-attendance notifications
* Exportable attendance reports
* Improved QR security
* Advanced attendance analytics
* Better mobile optimization
* Automated email notifications

---

## 👨‍💻 Author

**Sumit Mandal**

GitHub:
https://github.com/sumitmandalwebdev-afk

---

## ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project currently does not specify a separate open-source license.
