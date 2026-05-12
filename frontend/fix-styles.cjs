const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                .replace(/cf-text-primary/g, 'cf-text')
                .replace(/cf-text-secondary/g, 'cf-muted')
                .replace(/cf-button-primary/g, 'cf-btn cf-btn-primary')
                .replace(/cf-button-secondary/g, 'cf-btn cf-btn-secondary');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInDir(path.resolve(__dirname, 'src'));
