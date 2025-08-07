const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

