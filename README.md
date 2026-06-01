# 🎓 E.G.S College Management System

A comprehensive full-stack College Management System designed to streamline academic, administrative, and departmental operations within educational institutions.

## 📌 Overview

The College Management System (CMS) is a web-based platform that centralizes student, faculty, departmental, and administrative activities into a single secure application. The system provides role-based access for Students, Staff, HODs, Principal, Office Staff, and Administrators to efficiently manage academic and operational workflows.

---

## 🚀 Features

### 👨‍🎓 Student Module

* Student Dashboard
* View Attendance
* View Marks & Results
* Access Study Materials
* Placement Opportunities
* Notifications
* Department-Based Learning Resources
* Profile Management

### 👨‍🏫 Staff Module

* Upload Study Materials
* Create & Manage Tests
* Manage Student Results
* Student Communication
* Department Reports

### 🏢 Office Staff Module

* Student Admission Management
* Faculty Management
* Faculty Salary Management
* Student Record Maintenance

### 🎯 HOD Module

* Department Dashboard
* Assign Attendance Coordinators
* Assign Sports Coordinators
* Assign Discipline Coordinators
* Department Analytics & Reports

### 👨‍💼 Principal Module

* Assign or Remove HODs
* Department Monitoring
* Academic Performance Reports
* Attendance Monitoring
* Faculty Overview

### ⚙️ Admin Module

* User Management
* Department Management
* System Configuration
* Access Control Management
* Activity Monitoring

### 🧪 Laboratory Infrastructure Module

* Laboratory Management
* Equipment Tracking
* Maintenance Records
* Lab Incharge Management
* Department-wise Lab Monitoring

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* React Hot Toast

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT Authentication
* Role-Based Access Control (RBAC)
* Protected Routes
* Password Hashing using bcrypt

### Real-Time Features

* Socket.io

### Deployment

* AWS EC2
* Nginx
* PM2
* Vercel
* Render

---

## 👥 User Roles

| Role         | Responsibilities                            |
| ------------ | ------------------------------------------- |
| Student      | Attendance, Marks, Materials, Notifications |
| Staff        | Materials, Tests, Results                   |
| Office Staff | Admissions, Faculty, Salary                 |
| HOD          | Coordinator Management, Reports             |
| Principal    | HOD Management, Monitoring                  |
| Admin        | User & System Management                    |

---

## 📂 Project Structure

```bash
College-Management-System/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── layouts/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── utils/
│
├── README.md
├── package.json
└── .env
```

---

## 🔐 Authentication Flow

1. User Login
2. JWT Token Generation
3. Role Validation
4. Route Authorization
5. Dashboard Access Based on Role

---

## 📊 Major Modules

* Student Management
* Faculty Management
* Department Management
* Attendance Management
* Marks Management
* Fee Management
* Admission Management
* Salary Management
* Placement Management
* Laboratory Infrastructure Management
* Notifications System
* Report Generation

---

## ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/college-management-system.git
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

## 📈 Future Enhancements

* Mobile Application
* AI-Based Analytics
* Parent Portal
* Online Fee Payment
* SMS Notifications
* Biometric Attendance Integration
* AI Career Guidance Module

---

## 🎯 Objectives

* Reduce paperwork
* Improve data accuracy
* Centralize academic operations
* Enhance communication
* Provide real-time information access
* Improve institutional efficiency

---

## 📷 Screenshots

* Login Page
* Student Dashboard
* Staff Dashboard
* HOD Dashboard
* Principal Dashboard
* Admin Dashboard
* Attendance Management
* Laboratory Management
* Reports & Analytics

---

## 📜 License

This project is developed for academic and educational purposes.

---

## 👨‍💻 Developed By

**Abinesh R**
B.E. Computer Science and Business Systems

E.G.S Pillay Engineering College

Academic Major Project – 2026
