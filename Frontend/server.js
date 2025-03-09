/**
 * Simple HTTP server that disables caching
 * Save this as server.js and run with: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Port to use
const PORT = 8080;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
};

// Create the server
const server = http.createServer((req, res) => {
  // Add no-cache headers to all responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  
  // Convert root path to index.html
  if (pathname === './') {
    pathname = './index.html';
  }
  
  // Get file extension
  const ext = path.parse(pathname).ext;
  
  // Read the file
  fs.readFile(pathname, (err, data) => {
    if (err) {
      // If the file doesn't exist, return 404
      if (err.code === 'ENOENT') {
        // Check if it's a directory
        if (fs.existsSync(pathname) && fs.lstatSync(pathname).isDirectory()) {
          // Try to serve index.html from that directory
          return fs.readFile(path.join(pathname, 'index.html'), (err, data) => {
            if (err) {
              res.statusCode = 404;
              res.end(`File ${pathname}/index.html not found!`);
            } else {
              res.setHeader('Content-type', 'text/html');
              res.end(data);
            }
          });
        }
        
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
      } else {
        // If there's another error, return 500
        res.statusCode = 500;
        res.end(`Error reading file: ${err.code}`);
      }
    } else {
      // If the file is found, set the content type and serve it
      res.setHeader('Content-type', MIME_TYPES[ext] || 'text/plain');
      res.end(data);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Frontend Server running`);
});