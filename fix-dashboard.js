const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'client/src/pages/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix American distribution spacing
const americanPattern = /(<span>Distribution.*?<\/span>\s*<span>)({.*?american.*?}\%<\/span>)/s;
content = content.replace(americanPattern, '$1{(dashboardStats.nationalityCounts.american/statistics.activeInstructors*100).toFixed(1)} %</span>');

// Fix British distribution spacing
const britishPattern = /(<span>Distribution.*?<\/span>\s*<span>)({.*?british.*?}\%<\/span>)/s;
content = content.replace(britishPattern, '$1{(dashboardStats.nationalityCounts.british/statistics.activeInstructors*100).toFixed(1)} %</span>');

// Fix Canadian distribution spacing
const canadianPattern = /(<span>Distribution.*?<\/span>\s*<span>)({.*?canadian.*?}\%<\/span>)/s;
content = content.replace(canadianPattern, '$1{(dashboardStats.nationalityCounts.canadian/statistics.activeInstructors*100).toFixed(1)} %</span>');

fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed all spacing issues in Dashboard.tsx');
