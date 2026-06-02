const fs = require('fs');
const content = fs.readFileSync('src/pages/work/index.astro', 'utf8');
const lines = content.split('\n');

const cssStart = lines.findIndex(l => l.includes('<style>'));
const cssEnd = lines.findIndex((l, i) => i > cssStart && l.includes('</style>'));

const scriptStart = lines.findIndex(l => l.includes('<script>'));
const scriptEnd = lines.findIndex((l, i) => i > scriptStart && l.includes('</script>'));

const cssContent = lines.slice(cssStart + 1, cssEnd).join('\n');
const scriptContent = lines.slice(scriptStart + 1, scriptEnd).join('\n');

fs.writeFileSync('src/styles/pages/work.css', cssContent);
fs.writeFileSync('src/scripts/pages/work.ts', scriptContent);

const frontmatterEnd = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
lines.splice(frontmatterEnd, 0, 'import \'../../styles/pages/work.css\';');

const newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<script>')) {
    newLines.push('<script src="../../scripts/pages/work.ts"></script>');
    skip = true;
  }
  if (lines[i].includes('<style>')) {
    skip = true;
  }
  if (!skip) {
    newLines.push(lines[i]);
  }
  if (lines[i].includes('</script>') || lines[i].includes('</style>')) {
    skip = false;
  }
}

fs.writeFileSync('src/pages/work/index.astro', newLines.join('\n'));
console.log('Extraction complete');
