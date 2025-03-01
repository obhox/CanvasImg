# Canvas Image Editor

A powerful web-based image editor built with React that allows users to manipulate images, add watermarks, shapes, and text with an intuitive interface.

## Features

### Image Handling
- Upload and display main images
- Support for multiple image formats (PNG, JPG, JPEG, SVG, GIF)
- Multi-canvas support with thumbnail previews
- Zoom in/out functionality
- Export images in high quality

### Design Elements
- Text elements with customizable:
  - Font family
  - Font size
  - Color
  - Position
  - Rotation
  - Scale
- Shapes (Rectangle, Circle, Triangle) with:
  - Custom colors
  - Adjustable size
  - Position control
  - Rotation
  - Scale
  - Opacity

### Watermark Support
- Upload and manage multiple watermarks
- Drag-and-drop positioning
- Adjustable:
  - Scale
  - Opacity
  - Rotation
- Maintain aspect ratio during transformations

### Canvas Management
- Multiple canvas support
- Thumbnail preview strip
- Individual canvas controls
- Batch export capability
- Save/load canvas templates

### User Interface
- Clean and intuitive design
- Sidebar with design elements
- Properties panel for selected elements
- Real-time preview of changes
- Responsive layout

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/obhox/CanvasImg.git
```

2. Navigate to the project directory:
```bash
cd CanvasImg
```

3. Install dependencies:
```bash
npm install
# or
yarn install
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Open your browser and visit `http://localhost:3000`

## Usage

1. **Upload Images**
   - Click the upload button in the toolbar to add main images
   - Each image creates a new canvas

2. **Add Design Elements**
   - Use the sidebar to add text or shapes
   - Drag and drop elements onto the canvas

3. **Add Watermarks**
   - Upload watermark images in the sidebar
   - Drag and drop them onto the canvas

4. **Edit Elements**
   - Click any element to select it
   - Use the properties panel to adjust:
     - Position (drag and drop)
     - Scale
     - Rotation
     - Opacity
     - Color (for shapes and text)
     - Font properties (for text)

5. **Export**
   - Click the export button to save individual canvases
   - Use batch export to save all canvases at once

## Built With

- React
- Tailwind CSS
- Lucide Icons
- JSZip (for batch exports)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
