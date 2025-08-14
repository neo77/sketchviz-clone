class GraphvizEditor {
  constructor() {
    this.viz = null;
    this.initElements();
    this.initGraphviz();
    this.initEventListeners();
    this.initResizer();
    this.debounceTimer = null;
    this.filename = 'Untitled';
    this.edited = false;
    this.syntaxError = false;
  }

  initElements() {
    this.codeEditor = document.getElementById('code-editor');
    this.graphOutput = document.getElementById('graph-output');
    this.engineSelect = document.getElementById('engine-select');
    this.sketchyCheckbox = document.getElementById('sketchy-checkbox');
    this.renderBtn = document.getElementById('render-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.loadcxBtn = document.getElementById('loadcx-btn');
    this.loadcatBtn = document.getElementById('loadcat-btn');
    this.loadunderBtn = document.getElementById('loadunder-btn');
    this.loadmainBtn = document.getElementById('loadmain-btn');
    this.fileInput = document.getElementById('file-input');
    this.downloadBtn = document.getElementById('download-btn');
    this.resizer = document.querySelector('.resizer');
    this.editorPanel = document.querySelector('.editor-panel');
    this.previewPanel = document.querySelector('.preview-panel');
    this.titleBox = document.getElementById('titleBox');
    this.updateTitle();
  }

  async initGraphviz() {
    try {
      // Initialize the Viz.js library
      this.viz = new Viz();
      console.log('Graphviz initialized successfully');

      // Render the initial graph
      this.renderGraph();
    } catch (error) {
      console.error('Failed to initialize Graphviz:', error);
      this.showError('Failed to initialize Graphviz renderer. Please refresh the page.');
    }
  }

  initEventListeners() {
    // Render button click
    this.renderBtn.addEventListener('click', () => {
      this.syntaxError = false;
      this.renderGraph();
    });

    // Auto-render on text change (debounced)
    this.codeEditor.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.syntaxError = false;
        this.renderGraph();
      }, 1000); // 1 second delay
    });

    // Engine change
    this.engineSelect.addEventListener('change', () => {
      this.renderGraph();
    });

    // Sketchy checkbox change
    this.sketchyCheckbox.addEventListener('change', () => {
      this.renderGraph();
    });

    // Save button
    this.saveBtn.addEventListener('click', () => {
      this.saveCodeApi();
      // Save button
    });

    // Load button
    this.loadcatBtn.addEventListener('click', () => {
      this.loadDefaultCodeFromApi('categories.dot');
    });


    this.loadcxBtn.addEventListener('click', () => {
      this.loadDefaultCodeFromApi('cxAvailability.dot');
    });
    this.loadmainBtn.addEventListener('click', () => {
      console.log('loading main')
      this.loadDefaultCodeFromApi('main.dot');
    });
    this.loadunderBtn.addEventListener('click', () => {
      this.loadDefaultCodeFromApi('underperforming.dot');
    });
    // Load button
    this.loadBtn.addEventListener('click', () => {
      this.fileInput.click();
    });

    // File input change
    this.fileInput.addEventListener('change', (e) => {
      this.loadCode(e);
    });

    // Download button
    this.downloadBtn.addEventListener('click', () => {
      this.downloadGraph();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.renderGraph();
      }
    });
  }

  initResizer() {
    let isResizing = false;
    let startX = 0;
    let startWidthEditor = 0;
    let startWidthPreview = 0;

    this.resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startWidthEditor = this.editorPanel.offsetWidth;
      startWidthPreview = this.previewPanel.offsetWidth;
      this.resizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      const containerWidth = this.editorPanel.parentElement.offsetWidth - 4; // subtract resizer width

      let newEditorWidth = startWidthEditor + deltaX;
      let newPreviewWidth = startWidthPreview - deltaX;

      // Set minimum widths
      const minWidth = 200;
      if (newEditorWidth < minWidth) {
        newEditorWidth = minWidth;
        newPreviewWidth = containerWidth - minWidth;
      } else if (newPreviewWidth < minWidth) {
        newPreviewWidth = minWidth;
        newEditorWidth = containerWidth - minWidth;
      }

      // Apply new widths
      this.editorPanel.style.flex = `0 0 ${newEditorWidth}px`;
      this.previewPanel.style.flex = `0 0 ${newPreviewWidth}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        this.resizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  showLoading() {
    this.graphOutput.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <div>Rendering graph...</div>
            </div>
        `;
  }

  showError(message) {
    this.graphOutput.innerHTML = `
            <div class="error">${message}</div>
        `;
  }

  showPlaceholder() {
    this.graphOutput.innerHTML = `
            <div class="placeholder">Graph will appear here...</div>
        `;
  }

  updateTitle() {
    this.titleBox.innerText = this.filename + (this.edited ? '*' : '')
  }
  async renderGraph() {
    const code = this.codeEditor.value.trim();
    const engine = this.engineSelect.value;
    const isSketchy = this.sketchyCheckbox.checked;

    if (this.syntaxError) { return; }

    if (!code) {
      this.showPlaceholder();
      return;
    }

    console.log('rendering..')
    if (!this.viz) {
      this.showError('Graphviz is not initialized yet. Please wait...');
      return;
    }

    this.edited = true;
    this.updateTitle();

    this.showLoading();

    try {
      // Preprocess the code to handle font syntax like sketchviz.com
      const processedCode = this.preprocessCode(code);

      const svg = await this.viz.renderSVGElement(processedCode, { engine: engine });
      // Apply sketchy ffect if enabled

      if (isSketchy) {
        this.applyRoughJSEffect(svg);
      }

      // Clear the output and add the SVG element
      this.graphOutput.innerHTML = '';
      this.graphOutput.appendChild(svg);

      // Store the current SVG for download
      this.currentSvg = svg.outerHTML;

    } catch (error) {
      this.syntaxError = true;
      this.initGraphviz();
      console.error('Rendering error:', error);
      this.showError(`Rendering error: ${error.message}`);
    }
  }

  preprocessCode(code) {
    let processedCode = code;

    // Handle the *text* syntax for Sedgwick Ave font like sketchviz.com
    // This should be processed within label strings
    processedCode = processedCode.replace(/label\s*=\s*"([^"]*\*[^*]+\*[^"]*)"/g, (match, labelContent) => {
      // Replace *text* with regular text and add fontname if not already present
      const processedLabel = labelContent.replace(/\*([^*]+)\*/g, '$1');
      return `label="${processedLabel}"`;
    });

    // Also handle cases where the entire label is *text*
    processedCode = processedCode.replace(/label\s*=\s*"\*([^*]+)\*"/g, (match, text) => {
      return `label="${text}", fontname="Sedgwick Ave"`;
    });

    // Set default font to Tinos (like sketchviz.com)
    if (!processedCode.includes('fontname=') && !processedCode.includes('node [')) {
      // Add default font setting at the beginning of the graph
      processedCode = processedCode.replace(/(digraph|graph)\s+\w*\s*{/, (match) => {
        return match + '\n    node [fontname="Tinos"];';
      });
    }

    return processedCode;
  }

  applyRoughJSEffect(svg) {
    try {
      // Create RoughJS instance
      const roughSvg = rough.svg(svg);

      // Transform paths to sketchy style
      const paths = svg.querySelectorAll('path');
      paths.forEach(path => this.roughifyPath(path, roughSvg));

      // Transform ellipses to sketchy style
      const ellipses = svg.querySelectorAll('ellipse');
      ellipses.forEach(ellipse => this.roughifyEllipse(ellipse, roughSvg));

      // Transform rectangles to sketchy style
      const rects = svg.querySelectorAll('rect');
      rects.forEach(rect => this.roughifyRect(rect, roughSvg));

      // Transform polygons to sketchy style
      const polygons = svg.querySelectorAll('polygon');
      polygons.forEach(polygon => this.roughifyPolygon(polygon, roughSvg));

    } catch (error) {
      console.error('Error applying RoughJS effect:', error);
    }
  }

  roughifyPath(path, roughSvg) {
    const d = path.getAttribute('d');
    if (!d) return;

    try {
      // Get path styling
      const fill = path.getAttribute('fill') || 'none';
      const stroke = path.getAttribute('stroke') || 'black';
      const strokeWidth = parseFloat(path.getAttribute('stroke-width') || '1');

      // Create rough path
      const roughPath = roughSvg.path(d, {
        fill: fill === 'none' ? undefined : fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        roughness: 1.2,
        bowing: 0.8
      });

      // Replace original path
      path.parentNode.insertBefore(roughPath, path);
      path.parentNode.removeChild(path);
    } catch (error) {
      console.error('Error roughifying path:', error);
    }
  }

  roughifyEllipse(ellipse, roughSvg) {
    try {
      const cx = parseFloat(ellipse.getAttribute('cx') || '0');
      const cy = parseFloat(ellipse.getAttribute('cy') || '0');
      const rx = parseFloat(ellipse.getAttribute('rx') || '0');
      const ry = parseFloat(ellipse.getAttribute('ry') || '0');

      // Get styling
      const fill = ellipse.getAttribute('fill') || 'none';
      const stroke = ellipse.getAttribute('stroke') || 'black';
      const strokeWidth = parseFloat(ellipse.getAttribute('stroke-width') || '1');

      // Create rough ellipse
      const roughEllipse = roughSvg.ellipse(cx, cy, rx * 2, ry * 2, {
        fill: fill === 'none' ? undefined : fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        roughness: 1.2,
        bowing: 0.8
      });

      // Replace original ellipse
      ellipse.parentNode.insertBefore(roughEllipse, ellipse);
      ellipse.parentNode.removeChild(ellipse);
    } catch (error) {
      console.error('Error roughifying ellipse:', error);
    }
  }

  roughifyRect(rect, roughSvg) {
    try {
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');
      const width = parseFloat(rect.getAttribute('width') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');

      // Get styling
      const fill = rect.getAttribute('fill') || 'none';
      const stroke = rect.getAttribute('stroke') || 'black';
      const strokeWidth = parseFloat(rect.getAttribute('stroke-width') || '1');

      // Create rough rectangle
      const roughRect = roughSvg.rectangle(x, y, width, height, {
        fill: fill === 'none' ? undefined : fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        roughness: 1.2,
        bowing: 0.8
      });

      // Replace original rectangle
      rect.parentNode.insertBefore(roughRect, rect);
      rect.parentNode.removeChild(rect);
    } catch (error) {
      console.error('Error roughifying rect:', error);
    }
  }

  roughifyPolygon(polygon, roughSvg) {
    try {
      const pointsStr = polygon.getAttribute('points');
      if (!pointsStr) return;

      // Parse points
      const coords = pointsStr.split(/[\s,]+/).filter(p => p);
      const points = [];
      for (let i = 0; i < coords.length; i += 2) {
        points.push([parseFloat(coords[i]), parseFloat(coords[i + 1])]);
      }

      // Get styling
      const fill = polygon.getAttribute('fill') || 'none';
      const stroke = polygon.getAttribute('stroke') || 'black';
      const strokeWidth = parseFloat(polygon.getAttribute('stroke-width') || '1');

      // Create rough polygon
      const roughPolygon = roughSvg.polygon(points, {
        fill: fill === 'none' ? undefined : fill,
        stroke: stroke,
        strokeWidth: strokeWidth,
        roughness: 1.2,
        bowing: 0.8
      });

      // Replace original polygon
      polygon.parentNode.insertBefore(roughPolygon, polygon);
      polygon.parentNode.removeChild(polygon);
    } catch (error) {
      console.error('Error roughifying polygon:', error);
    }
  }

  async saveCodeApi(filename) {
    try {
      const code = this.codeEditor.value;

      // Ask user for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const defaultFilename = `graphviz-code-${timestamp}`;

      let filename = this.filename || prompt('Enter filename (without extension):', defaultFilename);

      // If user cancelled or entered empty string, use default
      if (filename === null) {
        return; // User cancelled
      }

      if (filename.trim() === '') {
        filename = defaultFilename;
      }

      // Clean filename - remove invalid characters
      filename = filename.trim().replace(/[<>:"/\\|?*]/g, '-');

      // Ensure .dot extension
      if (!filename.toLowerCase().endsWith('.dot')) {
        filename += '.dot';
      }

      const response = await fetch('/api/save-dotfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename, content: code })
      });


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log(`Code saved successfully as: ${filename}`);
      this.edited = false;
      this.updateTitle();
    } catch (error) {
      console.error('Error saving code:', error);
      alert('Failed to save code. Please try again.');
    }
  }

  loadCode(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const validExtensions = ['.dot', '.gv', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a valid file (.dot, .gv, or .txt)');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        this.codeEditor.value = content;

        // Auto-render the loaded code
        this.renderGraph();

        console.log('Code loaded successfully');
      } catch (error) {
        console.error('Error loading code:', error);
        alert('Failed to load code. Please try again.');
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to read file. Please try again.');
    };

    reader.readAsText(file);

    // Reset file input so the same file can be loaded again
    event.target.value = '';
  }
  loadDefaultCodeFromApi(filename) {
    console.log(filename)
    if (!filename) return;

    // Check file type

    fetch('/api/load-dotfile?filename=' + encodeURIComponent(filename), {
      method: 'GET',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
      })
      .then(content => {
        this.codeEditor.value = content;

        // Auto-render the loaded code
        this.renderGraph();

        console.log('Code loaded successfully');
        this.filename = filename
        this.titleBox.innerText = filename;
      })
      .catch(error => {
        console.error('Error loading code:', error);
        alert('Failed to load code. Please try again.');
      });
    // Reset file input so the same file can be loaded again
  }

  loadCodeFromApi(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const validExtensions = ['.dot', '.gv', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert('Please select a valid file (.dot, .gv, or .txt)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/load_dotfile?filename=' + encodeURIComponent(file.name), {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
      })
      .then(content => {
        this.codeEditor.value = content;

        // Auto-render the loaded code
        this.renderGraph();

        console.log('Code loaded successfully');
      })
      .catch(error => {

        console.error('Error loading code:', error);
        alert('Failed to load code. Please try again.');
      });

    // Reset file input so the same file can be loaded again
    event.target.value = '';
  }

  downloadGraph() {
    if (!this.currentSvg) {
      alert('No graph to download. Please render a graph first.');
      return;
    }

    try {
      // Create a canvas element to convert SVG to PNG
      const svgElement = this.graphOutput.querySelector('svg');
      if (!svgElement) {
        alert('No graph to download.');
        return;
      }

      // Create a new image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Get SVG dimensions
      const svgRect = svgElement.getBoundingClientRect();
      const svgData = new XMLSerializer().serializeToString(svgElement);

      // Set canvas size
      canvas.width = svgRect.width || 800;
      canvas.height = svgRect.height || 600;

      // Create blob URL for SVG
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to PNG and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'graph.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(svgUrl);
        }, 'image/png');
      };

      img.onerror = () => {
        // Fallback: download as SVG
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      };

      img.src = svgUrl;

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download graph. Please try again.');
    }
  }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new GraphvizEditor();
});

