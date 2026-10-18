const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'Motion Scroll Images');
const destDir = path.join(__dirname, '..', 'public', 'motion-frames-webp');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function convertAll() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} frames to convert...`);
  
  let completed = 0;
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const baseName = path.basename(file, path.extname(file)); // e.g. ezgif-frame-001
    const destPath = path.join(destDir, `${baseName}.webp`);
    
    await sharp(srcPath)
      .webp({ quality: 82, effort: 4 })
      .toFile(destPath);
      
    completed++;
    if (completed % 30 === 0 || completed === files.length) {
      console.log(`Converted ${completed}/${files.length} frames to WebP.`);
    }
  }
  console.log('All WebP frame conversions finished successfully!');
}

convertAll().catch(err => {
  console.error('Error during WebP conversion:', err);
  process.exit(1);
});
