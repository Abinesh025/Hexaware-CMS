const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument({
  bufferPages: true,
  margin: 50,
  size: 'A4'
});

const outputFilePath = 'HIT_College_Project_Report.pdf';
const stream = fs.createWriteStream(outputFilePath);
doc.pipe(stream);

// Styles & Palette
const primaryColor = '#1e293b'; // Slate 800
const accentColor = '#0ea5e9';  // Sky 500
const textColor = '#334155';    // Slate 700
const lightBg = '#f8fafc';      // Slate 50
const darkText = '#0f172a';     // Slate 900
const hrColor = '#cbd5e1';      // Slate 300

function drawHR() {
  doc.strokeColor(hrColor)
     .lineWidth(1)
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  doc.moveDown(1);
}

function addSection(title) {
  doc.addPage();
  doc.fillColor(primaryColor)
     .fontSize(22)
     .font('Helvetica-Bold')
     .text(title, { paragraphGap: 10 });
  drawHR();
}

function addSubSection(title) {
  doc.fillColor(accentColor)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text(title, { paragraphGap: 8 });
}

function addParagraph(text) {
  doc.fillColor(textColor)
     .fontSize(10)
     .font('Helvetica')
     .text(text, { lineGap: 3.5, paragraphGap: 12 });
}

// -------------------------------------------------------------
// COVER PAGE
// -------------------------------------------------------------
doc.rect(0, 0, 595, 842).fill('#0f172a'); // Cover BG

doc.fillColor('#ffffff')
   .fontSize(28)
   .font('Helvetica-Bold')
   .text('ACADEMIC COLLEGE MANAGEMENT', 50, 180, { align: 'center' })
   .text('INFORMATION SYSTEM (CMIS)', { align: 'center', paragraphGap: 25 });

doc.fillColor(accentColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('PROJECT REPORT', { align: 'center', paragraphGap: 180 });

doc.fillColor('#94a3b8')
   .fontSize(11)
   .font('Helvetica')
   .text('SUBMITTED BY:', { align: 'center', paragraphGap: 8 });

doc.fillColor('#ffffff')
   .fontSize(13)
   .font('Helvetica-Bold')
   .text('HARIPRASATH (Reg No: 810023104001)', { align: 'center', paragraphGap: 5 });

doc.fillColor('#94a3b8')
   .fontSize(11)
   .font('Helvetica')
   .text('DEPARTMENT OF COMPUTER SCIENCE AND BUSINESS SYSTEM', { align: 'center', paragraphGap: 5 })
   .text('E.G.S PILLAY COLLEGE OF ENGINEERING', { align: 'center', paragraphGap: 60 });

doc.fillColor('#64748b')
   .fontSize(10)
   .font('Helvetica')
   .text('ACADEMIC YEAR: 2025 - 2026', { align: 'center' });

// -------------------------------------------------------------
// CERTIFICATE
// -------------------------------------------------------------
doc.addPage();
doc.fillColor(darkText)
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('BONAFIDE CERTIFICATE', { align: 'center', paragraphGap: 15 });
doc.moveDown(1);

doc.fillColor(textColor)
   .fontSize(11.5)
   .font('Helvetica')
   .text(
     'This is to certify that the project report entitled "Academic College Management Information System (CMIS)" is a bonafide record of work done by Hariprasath (Reg No: 810023104001) in partial fulfillment of the requirements for the award of Bachelor of Engineering in Computer Science and Business system from E.G.S Pillay College of Engineering during the academic year 2025 - 2026.',
     { lineGap: 5, paragraphGap: 150 }
   );

// Signatures
const sigY = doc.y;
doc.strokeColor(primaryColor).lineWidth(1);

doc.moveTo(50, sigY).lineTo(170, sigY).stroke();
doc.moveTo(230, sigY).lineTo(350, sigY).stroke();
doc.moveTo(410, sigY).lineTo(530, sigY).stroke();

doc.fillColor(darkText)
   .fontSize(10)
   .font('Helvetica-Bold')
   .text('PROJECT GUIDE', 50, sigY + 8, { width: 120, align: 'center' })
   .text('HEAD OF DEPT', 230, sigY + 8, { width: 120, align: 'center' })
   .text('PRINCIPAL', 410, sigY + 8, { width: 120, align: 'center' });

// -------------------------------------------------------------
// DECLARATION
// -------------------------------------------------------------
doc.addPage();
doc.fillColor(darkText)
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('DECLARATION', { align: 'center', paragraphGap: 15 });
doc.moveDown(1);

doc.fillColor(textColor)
   .fontSize(11)
   .text(
     'I, Hariprasath, student of Computer Science and Business system, E.G.S Pillay College of Engineering, hereby declare that the project entitled "Academic College Management Information System (CMIS)" is an authentic record of my original work carried out under the guidance of Abinesh R, Student, Department of CSBS.',
     { lineGap: 5, paragraphGap: 20 }
   )
   .text(
     'This report is submitted in partial fulfillment of the requirements for the award of Bachelor of Engineering. It has not been submitted previously to any other university or institution for the award of any degree or diploma.',
     { lineGap: 5, paragraphGap: 100 }
   );

doc.text('Date: June 01, 2026', 50, doc.y)
   .text('Place: Chennai', 50, doc.y + 15)
   .text('Signature of Student: ___________________', 300, doc.y);

// -------------------------------------------------------------
// ACKNOWLEDGEMENT
// -------------------------------------------------------------
doc.addPage();
doc.fillColor(darkText)
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('ACKNOWLEDGEMENT', { align: 'center', paragraphGap: 15 });
doc.moveDown(1);

doc.fillColor(textColor)
   .fontSize(10.5)
   .text(
     'I express my deep gratitude to our Principal for his constant academic support and for providing state-of-the-art laboratory infrastructure to test and implement this web application.',
     { lineGap: 4.5, paragraphGap: 15 }
   )
   .text(
     'I am highly indebted to Abinesh R, Student, Department of CSBS, who acted as my project guide, for his valuable feedback, technical advice, and guidelines that made this project successful.',
     { lineGap: 4.5, paragraphGap: 15 }
   )
   .text(
     'Finally, I express my sincere appreciation to the faculty members of the CSBS department, the accounts office staff, and my friends for their help and collaboration during the system setup.',
     { lineGap: 4.5, paragraphGap: 15 }
   );

// -------------------------------------------------------------
// ABSTRACT
// -------------------------------------------------------------
doc.addPage();
doc.fillColor(darkText)
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('ABSTRACT', { align: 'center', paragraphGap: 15 });
doc.moveDown(1);

doc.fillColor(textColor)
   .fontSize(10.5)
   .text(
     'The Academic College Management Information System (CMIS) is a responsive, web-based automation portal designed for E.G.S Pillay College of Engineering. Moving away from manual logbooks, the system implements an integrated MERN stack application allowing role-based access control for six distinct actors: Student, Staff, HOD, Office Staff, Principal, and Admin.',
     { lineGap: 5, paragraphGap: 15 }
   )
   .text(
     'Features include secure authentication (traditional JWTs and custom OTP generation for faculty), a smart fees engine that differentiates computing vs. non-computing department fees, an exam marks ledger which validates LMS attendance records before grading lookups, administrative modules for faculty salary calculations, and a physical laboratory database directory. The application includes responsive React UI dashboards, Express REST APIs, real-time messaging using Socket.io, and comprehensive Swagger OpenAPI schemas for developers.',
     { lineGap: 5, paragraphGap: 15 }
   );

// -------------------------------------------------------------
// TABLE OF CONTENTS
// -------------------------------------------------------------
doc.addPage();
doc.fillColor(darkText)
   .fontSize(18)
   .font('Helvetica-Bold')
   .text('TABLE OF CONTENTS', { align: 'center', paragraphGap: 25 });

const toc = [
  { name: '1. Title Page & Certificate', page: '1 - 2' },
  { name: '2. Declaration & Acknowledgement', page: '3 - 4' },
  { name: '3. Abstract', page: '5' },
  { name: '4. Chapter 1: Introduction', page: '7' },
  { name: '5. Chapter 2: Literature Survey', page: '8' },
  { name: '6. Chapter 3: System Analysis', page: '9' },
  { name: '7. Chapter 4: System Design', page: '10' },
  { name: '8. Chapter 5: Technology Stack', page: '11' },
  { name: '9. Chapter 6: Module Description', page: '12' },
  { name: '10. Chapter 7: Implementation details', page: '13' },
  { name: '11. Chapter 8: Testing & Results', page: '14' },
  { name: '12. Chapter 9: System Screenshots', page: '15' },
  { name: '13. Chapter 10: Advantages & Enhancements', page: '16' },
  { name: '14. References & Appendices', page: '17 - 18' }
];

toc.forEach(item => {
  doc.fillColor(textColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(item.name, { continued: true })
     .font('Helvetica')
     .text(' .' + '.'.repeat(60 - item.name.length) + ' ' + item.page, { align: 'right', paragraphGap: 12 });
});

// -------------------------------------------------------------
// CHAPTER 1: INTRODUCTION
// -------------------------------------------------------------
addSection('Chapter 1: Introduction');
addSubSection('1.1 Overview');
addParagraph('The Academic College Management Information System (CMIS) is designed to coordinate administrative, academic, and resource data across E.G.S Pillay College of Engineering. Built on top of a centralized database, it provides role-specific portals to simplify complex operations.');

addSubSection('1.2 Problem Statement');
addParagraph('Manual management files and isolated spreadsheets cause significant delay, security issues, and data inconsistency. Specific challenges include manual lookup times, lack of real-time student updates, accounts-to-academics mismatches, and difficult eligibility calculations.');

addSubSection('1.3 Objectives');
addParagraph('• Student Portal: Dashboard for grades, materials, and fee status.\n• Faculty Module: Lecture note uploads, marks entries, and OTP login.\n• Attendance System: Class-by-class registration logs.\n• Dynamic Fees Bracket: Automated fee scales by department.\n• Lab Catalog: Equipment tracking, locations, and maintenance statuses.');

addSubSection('1.4 Scope of the System');
addParagraph('The platform serves students, faculty members, HODs, office staff, the principal, and system admins. Security routing controls and access middleware ensure each role can only execute permitted actions.');

// -------------------------------------------------------------
// CHAPTER 2: LITERATURE SURVEY
// -------------------------------------------------------------
addSection('Chapter 2: Literature Survey');
addSubSection('2.1 Existing Systems & Limitations');
addParagraph('Historically, administration relied on paper-based ledger registers and spreadsheets. These methods suffered from zero collaborative access, data redundancies, high update errors, and lacking validation processes to double-check student qualifications before showing grades.');

addSubSection('2.2 Proposed Solution');
addParagraph('We propose a unified, web-based College Management System. Using the MERN stack, the application establishes a secure architecture connecting financial records, exam results, and lab infrastructure directories to solve manual tracking overheads.');

// -------------------------------------------------------------
// CHAPTER 3: SYSTEM ANALYSIS
// -------------------------------------------------------------
addSection('Chapter 3: System Analysis');
addSubSection('3.1 Existing System Overview');
addParagraph('Traditional processes involve physical queues for fee payments, paper attendance lists, and manually entered marks registers. Disconnected files mean HODs and office staff struggle to compile report insights.');

addSubSection('3.2 Proposed System Benefits');
addParagraph('• Centralized Access: Live queries via Mongoose collections.\n• Real-Time Synchronized Data: Socket.io triggers messages instantly.\n• Security Guards: All endpoints verify JSON Web Tokens (JWT).\n• Automatic Validations: Automatic checks confirm student qualifications (e.g. attendance checked before marks are visible).');

// -------------------------------------------------------------
// CHAPTER 4: SYSTEM DESIGN
// -------------------------------------------------------------
addSection('Chapter 4: System Design');
addSubSection('4.1 System Architecture');
addParagraph('The application utilizes a Three-Tier Client-Server Architecture. The React.js frontend sends secure REST HTTP requests to the Express.js gateway. The gateway validates tokens and executes queries via Mongoose ODM schemas on the MongoDB database.');

addSubSection('4.2 Use Case & ERD Layout');
addParagraph('The database designs (User, Student, Faculty, Lab, Attendance, Marks, Salary, Fees) are interlinked. A User profile references a Student profile, which maps to attendance logs and marks registers. Faculty profiles reference salary sheets, keeping accounts logs separate from credentials.');

// -------------------------------------------------------------
// CHAPTER 5: TECHNOLOGY STACK
// -------------------------------------------------------------
addSection('Chapter 5: Technology Stack');
addParagraph('• Frontend: React.js, Vite builder, Vanilla CSS styling.\n• Backend: Node.js, Express.js server, Cors/Morgan middleware.\n• Database: MongoDB, Mongoose ODM schemas.\n• Real-time updates: Socket.io WebSockets.\n• API Specs: Swagger JSDoc UI page.\n• Deployment Proxy: Nginx config.');

// -------------------------------------------------------------
// CHAPTER 6: MODULE DESCRIPTION
// -------------------------------------------------------------
addSection('Chapter 6: Module Description');
addSubSection('6.1 Student & Staff Portals');
addParagraph('Students view grades, attendance logs, and fee balances. Staff members upload lecture files, create tests, and enter student marks.');

addSubSection('6.2 Office Staff & HOD Portals');
addParagraph('Office staff register admissions, record fees paid, and process payroll (basic, allowance, deductions, net salary). HODs manage department schedules and assign coordinators.');

addSubSection('6.3 Principal & Lab Infrastructure Portals');
addParagraph('The Principal manages HOD appointments and reviews institutional reports. The Lab Infrastructure module catalog lists system capacity, computer counts, locations, and maintenance statuses.');

// -------------------------------------------------------------
// CHAPTER 7: IMPLEMENTATION DETAILS
// -------------------------------------------------------------
addSection('Chapter 7: Implementation Details');
addSubSection('7.1 Authentication & Security');
addParagraph('Password hashing uses bcryptjs (10 rounds). When matching credentials, the server generates a JWT token including user ID and role payloads. Staff log in using a secure mail OTP generator (using nodemailer).');

addSubSection('7.2 Fees & Marks Entry Workflows');
addParagraph('Tuition calculations automatically set computing department fees to >= INR 50,000 and non-computing fees between INR 30,000 and 50,000. Marks entries check the database for verified LMS test attendance before allowing grades to be recorded.');

// -------------------------------------------------------------
// CHAPTER 8: TESTING & RESULTS
// -------------------------------------------------------------
addSection('Chapter 8: Testing & Results');
addSubSection('8.1 Unit Testing');
addParagraph('Unit tests written using Jest and Supertest verify the security controls:');
addParagraph('• Auth Test: Confirms login requests reject bad passwords.\n• Fee Logic: Verifies CSBS accounts are assigned fees in range.\n• Marks Entry Check: Rejects lookups for students who did not attend tests.');

// -------------------------------------------------------------
// CHAPTER 9: SYSTEM SCREENSHOTS
// -------------------------------------------------------------
addSection('Chapter 9: System Screenshots');
addParagraph('The system has been fully implemented with a premium custom design:');
addParagraph('• Homepage & Landing: Custom banners branded for E.G.S Pillay College of Engineering.\n• Unified Logins: Responsive accordion dropdown selectors separating user categories.\n• Marks Register Panel: Student select lists checking LMS test history.\n• Infrastructure Panel: Filters by CSE/CSBS departments showing active statuses.');

// -------------------------------------------------------------
// CHAPTER 10: ADVANTAGES
// -------------------------------------------------------------
addSection('Chapter 10: Advantages & Future scope');
addSubSection('10.1 Advantages');
addParagraph('• High database efficiency and zero data redundancy.\n• Strong security using role guards on all APIs.\n• Responsive web layouts suited for desktop, tablet, and mobile browsers.');

addSubSection('10.2 Future Enhancements');
addParagraph('• Native iOS and Android applications.\n• AI-driven predictive charts to highlight student performance trends.\n• Direct payment gateway integrations (Stripe, Razorpay).');

// -------------------------------------------------------------
// REFERENCES
// -------------------------------------------------------------
addSection('References & Appendices');
addSubSection('References');
addParagraph('1. React.js Documentation: https://react.dev/\n2. Express.js Guides: https://expressjs.com/\n3. MongoDB Mongoose ODM: https://mongoosejs.com/\n4. JWT Authentication Standards: https://jwt.io/');

addSubSection('Appendix: Core API Routes');
addParagraph('• POST /api/v1/auth/login - Credential verification.\n• POST /api/v1/auth/register - Onboarding registrations.\n• GET /api/v1/labs - Catalog database lookups.\n• GET /api/v1/attendance - Retrieves class logs.');

// -------------------------------------------------------------
// DYNAMIC HEADERS & FOOTERS (Double Pass)
// -------------------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  if (i === 0) continue; // Skip cover page

  // Header
  doc.fillColor('#94a3b8')
     .fontSize(8)
     .font('Helvetica')
     .text('E.G.S Pillay College of Engineering — Academic Project Report', 50, 30);
  
  doc.strokeColor(hrColor)
     .lineWidth(0.5)
     .moveTo(50, 40)
     .lineTo(545, 40)
     .stroke();

  // Footer
  doc.strokeColor(hrColor)
     .lineWidth(0.5)
     .moveTo(50, 800)
     .lineTo(545, 800)
     .stroke();

  doc.fillColor('#94a3b8')
     .fontSize(8)
     .text(`Page ${i + 1} of ${range.count}`, 50, 810, { align: 'right' });
}

doc.end();
console.log('Project Report PDF compiled successfully.');
