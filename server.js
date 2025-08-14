const express = require('express');
const fs = require('fs');
const path = require('path');

const DOTFILES_DIR = './dotfiles';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ensure the dotfiles directory exists
if (!fs.existsSync(DOTFILES_DIR)) {
  fs.mkdirSync(DOTFILES_DIR);
}

// Endpoint to save a dotfile
app.post('/api/save-dotfile', (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    console.log('err fn content' + '|' + filename + '|' + content)
    return res.status(400).send('Filename and content are required');
  }
  fs.writeFile(path.join(DOTFILES_DIR, filename), content, (err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send('Dotfile saved successfully');
  });
});

// Endpoint to load a dotfile
app.get('/api/load-dotfile', (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).send('Filename is required');
  }
  fs.readFile(path.join(DOTFILES_DIR, filename), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(data);
  });
});


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for processing Graphviz code (placeholder for now)
app.post('/api/render', (req, res) => {
  const { code, engine } = req.body;

  // For now, return a simple response
  // Later this will process the Graphviz code and return SVG
  res.json({
    success: true,
    message: 'Code received',
    code: code,
    engine: engine || 'dot'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

