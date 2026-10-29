const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building ECO TRACK frontend for production...');
execSync('npm run build', { cwd: path.join(__dirname, '..', 'frontend'), stdio: 'inherit' });

const distPath = path.join(__dirname, '..', 'frontend', 'dist');
console.log('📦 Deploying dist to gh-pages branch...');

try {
  execSync('git init', { cwd: distPath, stdio: 'inherit' });
  execSync('git checkout -B gh-pages', { cwd: distPath, stdio: 'inherit' });
  execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
  execSync('git commit -m "Deploy ECO TRACK to GitHub Pages"', { cwd: distPath, stdio: 'inherit' });
  execSync('git remote add origin https://github.com/saidabhukya/ECO.git', { cwd: distPath, stdio: 'inherit' });
  execSync('git push -f origin gh-pages', { cwd: distPath, stdio: 'inherit' });
  console.log('🎉 Successfully deployed to GitHub Pages!');
} finally {
  const gitInDist = path.join(distPath, '.git');
  if (fs.existsSync(gitInDist)) {
    fs.rmSync(gitInDist, { recursive: true, force: true });
  }
}
