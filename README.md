# Graphviz Editor - Sketchviz Clone

A web-based Graphviz editor that mimics the functionality and look of sketchviz.com, complete with sketchy hand-drawn rendering effects.

## Features

- **Live Graphviz Rendering**: Edit DOT language code and see results in real-time
- **Multiple Layout Engines**: Support for dot, neato, twopi, circo, fdp, and osage
- **Sketchy Mode**: Hand-drawn, sketchy appearance using RoughJS (just like sketchviz.com)
- **Font Support**: Supports Tinos (default), Handlee, and Sedgwick Ave fonts
- **Special Syntax**: Use `*text*` to automatically apply Sedgwick Ave font
- **Resizable Panes**: Drag the divider to adjust editor and preview sizes
- **Auto-render**: Automatic rendering with debounced input (1-second delay)
- **Save/Load Code**: Save your Graphviz code to local files (.dot format) and load them back
- **Download**: Export graphs as PNG images
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to render

## Font Features (like sketchviz.com)

1. **Default Font**: Tinos (automatically applied)
2. **Handlee Font**: Use `fontname="Handlee"` in node/edge attributes
3. **Sedgwick Ave Font**: Use `fontname="Sedgwick Ave"` or the shortcut `*text*`

## Example Usage

```dot
digraph G {
    A [label="Node A"];
    B [label="Node B"];
    C [label=*"Sketchy Font"* fontname="Handlee"];
    D [label="Node D"];
    
    A -> B [label="connects to"];
    B -> C;
    C -> A;
    A -> D [label=*"sketchy edge"*];
    D -> B;
}
```

## Installation & Running

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and go to `http://localhost:3000`

## Technologies Used

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Graphviz Rendering**: Viz.js (WebAssembly port of Graphviz)
- **Sketchy Effects**: RoughJS
- **Fonts**: Google Fonts (Tinos, Handlee, Sedgwick Ave)

## Save/Load Functionality

- **Save Code**: Click "Save Code" to download your current Graphviz code as a .dot file with custom filename
  - Prompts for filename input (without extension)
  - Automatically adds .dot extension if not present
  - Sanitizes filename by removing invalid characters
  - Uses timestamp as default if no filename provided
- **Load Code**: Click "Load Code" to upload and load a .dot, .gv, or .txt file
- **Supported Formats**: .dot (Graphviz), .gv (Graphviz), .txt (plain text)
- **Auto-render**: Loaded code is automatically rendered upon successful loading

## Sketchy Mode

When the "Sketchy" checkbox is enabled, the application uses RoughJS to transform the clean SVG output from Graphviz into a hand-drawn, sketchy appearance that matches sketchviz.com's aesthetic.

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

MIT License

