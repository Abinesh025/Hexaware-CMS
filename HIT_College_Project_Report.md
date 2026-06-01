# ACADEMIC COLLEGE MANAGEMENT INFORMATION SYSTEM (CMIS)
## PROJECT DOCUMENTATION & SYSTEM MANUAL

---

## 1. Title Page

* **Project Title:** Academic College Management Information System (CMIS)
* **Student Name:** Hariprasath
* **Register Number:** 810023104001
* **Department:** Department of Computer Science and Business system
* **College Name:** E.G.S Pillay College of Engineering
* **Academic Year:** 2025 - 2026
* **Guide Name:** Abinesh R,Student Department of CSBS

---

## 2. Certificate

### E.G.S Pillay College of Engineering
**DEPARTMENT OF COMPUTER SCIENCE AND BUSINESS SYSTEM**

This is to certify that the project report entitled **"Academic College Management Information System (CMIS)"** is a bonafide record of work done by **Hariprasath (Reg No: 810023104001)** under our supervision and guidance in partial fulfillment of the requirements for the degree of Bachelor of Engineering in Computer Science and Business system.

\
\
\
\
---

## 3. Declaration

I, **Hariprasath (Reg No: 810023104001)**, hereby declare that this project report entitled **"Academic College Management Information System (CMIS)"** submitted to the Department of Computer Science and Business system, E.G.S Pillay College of Engineering, is an authentic record of my original work carried out under the guidance of **Abinesh R**, Student, Department of CSBS. 

This work has not previously formed the basis for the award of any Degree, Diploma, Associate-ship, or Fellowship in this or any other Institution.

\
\
**Place:** Chennai  
**Date:** June 01, 2026  
**Signature of Student:** __________________

---

## 4. Acknowledgement

I express my deep sense of gratitude and respect to our Principal for providing the academic ecosystem and facilities to execute this project.

I am highly indebted to the Head of the Department and my project guide for their invaluable guidance, persistent encouragement, and constructive criticisms throughout the development of this project.

I would also like to thank all the faculty members of the Department of Computer Science and Business system for their constant support and coordination. Finally, I thank the College Management and my peers for their direct and indirect assistance in completing this project successfully.

---

## 5. Abstract

The **Academic College Management Information System (CMIS)** is a comprehensive web-based platform designed to automate administrative and academic processes within H.I.T College of Engineering. The system transitions the college from fragmented, error-prone manual record-keeping to a unified, role-based real-time database. Developed using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), the platform supports distinct authorization scopes for six user roles: **Student, Staff, HOD, Office Staff, Principal, and Admin**.

Key features include:
1. **User Onboarding and Security:** Secure credentials using bcrypt encryption and a secure OTP login service for staff members.
2. **Tuition Fees Engine:** Enforces dynamic thresholds where computing department fees are structured above INR 50,000 and non-computing fees scale between INR 30,000 and 50,000.
3. **Marks and Exam Ledger:** A portal allowing students to view grades only after verification of their exam attendance via the LMS.
4. **Payroll and Salary Management:** Automatic calculation of basic, allowance, deduction, and net pay components for faculty and office staff.
5. **Laboratory Infrastructure Directory:** Catalog of laboratory setups, equipment counts, maintenance timelines, and active status indicators.

---

## 6. Table of Contents

1. **Chapter 1: Introduction**
   - 1.1 Overview
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope of the System
2. **Chapter 2: Literature Survey**
   - 2.1 Existing Systems & Limitations
   - 2.2 Proposed Solution
3. **Chapter 3: System Analysis**
   - 3.1 Existing System Overview
   - 3.2 Proposed System Benefits
4. **Chapter 4: System Design**
   - 4.1 Architecture Diagram
   - 4.2 Use Case Diagram
   - 4.3 Entity-Relationship (ER) Diagram
   - 4.4 Database Design
5. **Chapter 5: Technology Stack**
6. **Chapter 6: Module Description**
7. **Chapter 7: Implementation Details**
8. **Chapter 8: Testing & Results**
9. **Chapter 9: Screenshots Reference**
10. **Chapter 10: Advantages of the System**
11. **Chapter 11: Future Enhancements**
12. **Chapter 12: Conclusion**
13. **References**
14. **Appendices**
    - Appendix A: API Endpoints
    - Appendix B: Database Schemas
    - Appendix C: Project Folder Structure
    - Appendix D: Sample Reports

---

## 7. List of Figures

* **Figure 4.1:** Three-Tier Architecture Block Diagram
* **Figure 4.2:** Use Case Diagram for Role Interactions
* **Figure 4.3:** Entity-Relationship Diagram (ERD)
* **Figure 9.1:** Landing Page and Unified Sign-In Dropdown Layout
* **Figure 9.2:** Administrator Dashboard Stats Overview
* **Figure 9.3:** Marks Management Portal with Dynamic Verification
* **Figure 9.4:** Lab Infrastructure Status and Directory Panel

---

## 8. List of Tables

* **Table 4.1:** Users Collection Schema mapping
* **Table 4.2:** Students Collection Schema mapping
* **Table 4.3:** Laboratory Details Database Directory
* **Table 8.1:** Unit Test Verification Cases and Outcomes

---

## Chapter 1: Introduction

### 1.1 Overview
The **Academic College Management Information System (CMIS)** is a centralized platform designed to administer academic activities, personnel records, financial transactions, and physical resources at H.I.T College of Engineering. By implementing role-based dashboards, CMIS streamlines workflow automation across departments.

### 1.2 Problem Statement
Colleges relying on manual ledgers, paper files, or isolated spreadsheets face severe operational bottlenecks. Problems include:
* Slow data access and high lookup times for academic transcripts and fees status.
* Data discrepancies and duplicate entries between the accounts office and academic departments.
* Difficulties in validating student exam eligibility relative to attendance.

### 1.3 Objectives
* **Student Portal:** Access to view attendance history, download materials, and view marks ledgers.
* **Faculty Management:** Tools for staff to upload notes, manage exams, and register marks.
* **Attendance Ledger:** Daily class records tracking present/absent student details.
* **Smart Fees System:** Automatically determine fee brackets based on departments.
* **Marks Ledger:** Restricts marks lookup to students who have attended their scheduled tests.
* **Laboratory Management:** Real-time visibility into college computer labs, hardware counts, and maintenance logs.

### 1.4 Scope of the System
* **Admin:** Oversees database collections, creates/deletes user profiles, and updates configurations.
* **Principal:** Reviews departmental statistics, tracks institutional budgets, and appoints HODs.
* **HOD:** Coordinates department faculty schedules, assigns course coordinators, and tracks students.
* **Office Staff:** Handles admissions paperwork, fee collection records, and faculty salary calculations.
* **Staff/Faculty:** Takes class attendance, uploads learning materials, and conducts tests.
* **Student:** Reviews personal files, checks fees balance, and views grades.

---

## Chapter 2: Literature Survey

### 2.1 Existing Systems & Limitations
Historically, academic administration was managed through:
1. **Paper-Based Ledgers:** Slow, highly vulnerable to physical damage, and lacking database indexes.
2. **Decentralized Office Tools (Excel):** Leads to isolated data silos, security vulnerabilities, and zero multi-user collaboration.
3. **Basic LMS Tools:** Miss integration with payroll, fees balances, or lab assets.

### 2.2 Proposed Solution
A **web-based College Management System** containing a single MongoDB backend. It uses strict route-level middleware validations to connect student performance, financial standing, and infrastructure assets together in a fast, secure application.

---

## Chapter 3: System Analysis

### 3.1 Existing System
* **Manual Attendance:** Hours of processing monthly lists by hand.
* **Offline Fee Collection:** Requires students to submit bank slips to the clerk, causing long queues and verification delays.
* **Static Asset Tracking:** Lab inventories are logged in registry books, leaving the IT department unaware of broken systems or capacity limits.

### 3.2 Proposed System
* **Automated Processing:** Fast lookups and automatic balances.
* **Role-Based Guards:** Cross-checks JWTs on the server before processing operations.
* **Real-time Synchronization:** Shared Socket.io networks enable instant notifications and messaging.

---

## Chapter 4: System Design

### 4.1 Architecture Diagram
```
  [ React.js Web UI Client ]
             │ (HTTP Requests & WebSockets)
             ▼
  [ Node.js / Express.js API Gateway ] ◄──► [ JSON Web Token (JWT) Guard ]
             │ (Mongoose ODM queries)
             ▼
  [ MongoDB Database Instance ]
```

### 4.2 Use Case Diagram
* **Student Actors:** View Materials $\rightarrow$ View Marks $\rightarrow$ Verify Attendance $\rightarrow$ Chat.
* **Staff Actors:** Upload Materials $\rightarrow$ Register Student Marks $\rightarrow$ Check Salary.
* **HOD / Principal:** Assign Roles $\rightarrow$ Monitor Operations $\rightarrow$ Read Reports.
* **Office Staff:** Run Admissions $\rightarrow$ Calculate Faculty Salaries.

### 4.3 ER Diagram
```
  +--------------+          +-----------------+          +----------------+
  |     User     | 1 ─── 1  |     Student     | 1 ─── *  |     Marks      |
  |  (Auth Info) |          | (Fee/Semester)  |          | (Test Grades)  |
  +--------------+          +-----------------+          +----------------+
         │ 1                         │ 1
         │                           │
         │ 1                         │ *
  +--------------+          +-----------------+
  |    Faculty   | 1 ─── *  |    Attendance   |
  | (Salary/Dept)|          |  (Class Records)|
  +--------------+          +-----------------+
```

### 4.4 Database Design
Refer to **Appendix B** for complete schema layouts.

---

## Chapter 5: Technology Stack

* **Frontend Framework:** React.js initialized via Vite.
* **CSS System:** Vanilla CSS designed with clean color palettes, glassmorphism modules, and interactive hover transitions.
* **Backend Runtime:** Node.js with Express.js REST controllers.
* **Database engine:** MongoDB with Mongoose ODM object modeling.
* **Real-time network:** Socket.io for immediate text communications.
* **API Documentation:** Swagger UI JSDoc configuration exposed via `/api/v1/docs`.
* **Reverse Proxy:** Nginx with configuration mapping client static folders and proxying `/api` requests to port 5000.

---

## Chapter 6: Module Description

### 6.1 Student Module
Allows students to view dynamic statistics including classes attended, outstanding fees balances, download class files, and message subject teachers.

### 6.2 Staff Module
Provides a interface to create exam slots, grade student answers, and review class performance metrics.

### 6.3 Office Staff Module
Equips administrative personnel with student admissions tools and a payroll module to enter basic rates and calculate faculty net salaries.

### 6.4 HOD & Principal Modules
Gives academic leaders data oversight. The Principal can assign HOD duties, and HODs can assign course coordinators, compile lists of failing students, and monitor academic progress.

### 6.5 Laboratory Infrastructure Module
Houses static configurations for hardware, system capacity, and maintenance tracking:
* CSE Lab 1: Programming Lab (60 Systems, Active status).
* CSE Lab 2: DBMS Lab (60 Systems, Active status).
* CSBS Lab: Business Analytics Lab (50 Systems, Active status).

---

## Chapter 7: Implementation Details

### 7.1 Authentication Flow
```
  [User Login Form] ──(Credentials)──► [API: /login] ──► [Verify Hash]
                                                              │
  [Generate & Return JWT] ◄────────(Token + Payload)──────────┘
```

### 7.2 Attendance & Marks Integration
```
  [Staff inputs marks] ──► [Validate Student LMS Attendance]
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      ▼ (Attended Test)                                       ▼ (Did Not Attend)
  [Save marks to Marks Ledger]                            [Block and throw Error]
```

---

## Chapter 8: Testing

### 8.1 Unit Testing
Tests written in Jest verify backend controllers:
* **Authentication test:** Validates password hashing and correct token response format.
* **Fees check:** Enforces calculation rules ($Fees \ge 50000$ for Computer Science, and $30000 \le Fees \le 50000$ for others).
* **Labs validation:** Rejects entries missing required codes or incharge identifiers.

### 8.2 Test Table
| Test Case ID | Feature Tested | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-001 | Auth Login | Valid email & password | Status 200 + JWT token | Passed |
| TC-002 | Computing Fees | CSE Dept student | Fees set to $\ge$ 50,000 | Passed |
| TC-003 | Marks Entry | Student with no test attendance | Rejects entry with warning | Passed |

---

## Chapter 9: Screenshots Reference

*(For actual layout screens, refer to the user interface on deployment)*
* **Login Accordion:** Responsive dropdown card grouping logins for Student/Faculty, Principal, and Office Staff.
* **Marks Ledger Page:** Student selection dropdown with check validating test attendance.
* **Lab Directory Page:** Department filter tabs showing capacity, locations, and maintenance updates.

---

## Chapter 10: Advantages of the System

1. **Centralized Platform:** Academic performance, payroll status, and resource inventory live in a single Mongo instance.
2. **Automated Verification:** Eliminates invalid marks inputs by checking database logs.
3. **Optimized Interface:** Custom CSS designs offer responsive, clean views.
4. **Paper Reduction:** Digital files and downloads replace paper records.

---

## Chapter 11: Future Enhancements

1. **Mobile App:** React Native app for mobile access.
2. **Biometric Integration:** Connect classrooms to IoT fingerprint devices to log attendance automatically.
3. **Payment Gateways:** Standard Stripe/Razorpay checkouts to pay outstanding fees.

---

## Chapter 12: Conclusion

The **Academic College Management Information System (CMIS)** successfully addresses the problems of manual records at H.I.T College of Engineering. By implementing role-based route verification, automated exam checks, and a lab infrastructure database, CMIS provides a reliable, secure, and modern college administration portal.

---

## References

1. **React Documentation:** https://react.dev/
2. **Node.js Documentation:** https://nodejs.org/
3. **Mongoose Schemas Reference:** https://mongoosejs.com/
4. **OpenAPI / Swagger Guidelines:** https://swagger.io/specification/
5. **Vite Builder Configuration:** https://vitejs.dev/

---

## Appendices

### Appendix A: API Endpoints

* **POST** `/api/v1/auth/register` - Onboard new users.
* **POST** `/api/v1/auth/login` - Authenticate users.
* **GET** `/api/v1/labs` - Fetch laboratory directory list.
* **POST** `/api/v1/attendance` - Create a new attendance ledger.
* **GET** `/api/v1/office/faculty/:id` - Load individual faculty profiles.

### Appendix B: Database Schemas

```javascript
// User Schema Example
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin', 'principal', 'office-staff', 'hod'], required: true },
  regnum: { type: String, unique: true, required: true },
  department: { type: String, required: true }
});
```

### Appendix C: Project Folder Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx (Interactive navbar with accordion dropdowns)
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx (Branded "H.I.T College of Engineering")
│   │   │   └── cmis/
│   │   │       ├── MarksManagement.jsx (Student grading dropdown)
│   │   │       └── LabManagement.jsx (Lab status panel)
│   │   └── index.css
├── server/
│   ├── config/
│   │   ├── db.js (MongoDB connectivity)
│   │   └── swagger.js (OpenAPI configuration)
│   ├── controllers/ (Business logic route controllers)
│   ├── middleware/ (Security checks & JWT checks)
│   ├── models/ (Mongoose schemas)
│   ├── routes/ (API routes mapping)
│   └── server.js (Initialization script)
```

### Appendix D: Sample Reports

```json
{
  "department": "CSE",
  "labName": "Programming Laboratory",
  "labCode": "CSE101",
  "capacity": 60,
  "numberOfSystems": 60,
  "labIncharge": "Staff In-Charge",
  "location": "Block A - First Floor",
  "status": "Active"
}
```
