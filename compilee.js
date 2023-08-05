const fs = require('fs');

// Create the ./artifacts directory if it doesn't exist
if (!fs.existsSync('./artifacts')) {
  fs.mkdirSync('./artifacts');
}

// Now execute the scrypt-cli compile command
const { execSync } = require('child_process');
execSync('npx scrypt-cli compile', { stdio: 'inherit' });
