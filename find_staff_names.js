const fs = require('fs');

const file = 'HIT_College_Project_Report.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const patterns = ['Dr.', 'Prof.', 'Kumar', 'Priya', 'Saravanan', 'Swaminathan', 'Abinesh R'];

lines.forEach((line, idx) => {
  const matches = patterns.some(p => line.includes(p));
  if (matches) {
    console.log(`${idx + 1}: ${line}`);
  }
});
