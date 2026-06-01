const fs = require('fs');

const file = 'HIT_College_Project_Report.md';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('incharge') || line.toLowerCase().includes('in-charge')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
