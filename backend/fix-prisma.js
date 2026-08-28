const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('new PrismaClient()')) {
        let dbPath = path.relative(path.dirname(fullPath), path.join(__dirname, 'src/core/config/db')).replace(/\\/g, '/');
        if (!dbPath.startsWith('.')) {
          dbPath = './' + dbPath;
        }
        
        content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;/g, `import prisma from '${dbPath}';`);
        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
