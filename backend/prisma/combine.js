const fs = require('fs');
const path = require('path');

const files = ['./prisma/base.prisma'];

function findFilesByExtension(startPath, filter) {
  let results = [];

  if (!fs.existsSync(startPath)) {
    console.warn('مسیر وجود ندارد:', startPath);
    return [];
  }

  const items = fs.readdirSync(startPath);

  for (const item of items) {
    const itemPath = path.join(startPath, item);
    const stat = fs.lstatSync(itemPath);

    if (stat.isDirectory()) {
      results = results.concat(findFilesByExtension(itemPath, filter));
    } else if (path.extname(itemPath).toLowerCase() === filter.toLowerCase()) {
      results.push(itemPath);
    }
  }

  return results;
}

const projectRoot = path.join(__dirname, '..', 'src/modules');
const fileExtension = '.prisma';

const foundFiles = findFilesByExtension(projectRoot, fileExtension);

for (const filePath of foundFiles) {
  files.push(filePath);
}

const combined = files
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n\n');
fs.writeFileSync('./prisma/schema.prisma', combined);
