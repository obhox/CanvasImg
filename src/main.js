import React, { useState, useRef, useEffect } from 'react';
import {
  Move, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Square, Circle, Triangle, Type, Image,
  Layers, Grid, Lock, Unlock, Eye, EyeOff, Undo, Redo,
  Copy, Trash2, Save, Download, Maximize, Grid3X3,
  RotateCcw, Upload, CheckSquare
} from 'lucide-react';

const CanvasEditor = () => {
  const [activeTab, setActiveTab] = useState('watermarks');
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [elements, setElements] = useState([]);
  const canvasRef = useRef(null);

  const [images, setImages] = useState([
    { id: 1, name: 'Sample Image 1', url: '/api/placeholder/800/600', active: true },
    { id: 2, name: 'Sample Image 2', url: '/api/placeholder/800/600', active: false },
    { id: 3, name: 'Sample Image 3', url: '/api/placeholder/800/600', active: false },
  ]);

  const designElements = {
    watermarks: [
      { id: 'w1', name: 'Text Watermark', type: 'text' },
      { id: 'w2', name: 'Logo Watermark', type: 'image' },
      { id: 'w3', name: 'Tiled Pattern', type: 'tiled' },
    ],
    shapes: [
      { id: 's1', name: 'Rectangle', icon: <Square size={24} /> },
      { id: 's2', name: 'Circle', icon: <Circle size={24} /> },
      { id: 's3', name: 'Triangle', icon: <Triangle size={24} /> },
    ],
    icons: [
      { id: 'i1', name: 'Arrow' },
      { id: 'i2', name: 'Star' },
      { id: 'i3', name: 'Social Media' },
    ],
    text: [
      { id: 't1', name: 'Heading' },
      { id: 't2', name: 'Subtitle' },
      { id: 't3', name: 'Body Text' },
    ],
  };

  const activeImage = images.find(img => img.active);

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData('element', JSON.stringify(element));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const element = JSON.parse(e.dataTransfer.getData('element'));
    setElements([...elements, { ...element, position: { x: e.clientX, y: e.clientY } }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const changeActiveImage = (id) => {
    setImages(images.map(img => ({
      ...img,
      active: img.id === id
    })));
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, or SVG)');
      return;
    }

    const url = URL.createObjectURL(file);
    const newImage = { 
      id: Date.now(), 
      name: file.name, 
      url, 
      active: false 
    };
    setImages(prev => [...prev, newImage]);
  };

  const handleSave = () => {
    // Placeholder for save functionality
    alert('Save functionality is not implemented yet.');
  };

  const handleExport = () => {
    // Placeholder for export functionality
    alert('Export functionality is not implemented yet.');
  };

  useEffect(() => {
    return () => {
      // Cleanup image URLs when component unmounts
      images.forEach(image => {
        if (image?.url) {
          try {
            const url = new URL(image.url);
            if (url.protocol === 'blob:') {
              URL.revokeObjectURL(image.url);
            }
          } catch (e) {
            console.error('Error cleaning up image URL:', e);
          }
        }
      });
    };
  }, [images]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="p-2 rounded hover:bg-gray-100">
            <Undo size={18} />
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <Redo size={18} />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <button className="p-2 rounded hover:bg-gray-100">
            <Copy size={18} />
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <Trash2 size={18} />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          <button className="p-2 rounded hover:bg-gray-100">
            <Lock size={18} />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" onClick={() => setShowGrid(!showGrid)}>
            <Grid3X3 size={18} color={showGrid ? '#3B82F6' : '#6B7280'} />
          </button>
        </div>

        <div className="flex space-x-2">
          <button className="p-2 rounded hover:bg-gray-100">
            <Eye size={18} />
          </button>
          <button className="bg-blue-500 text-white px-4 py-1 rounded flex items-center" onClick={handleSave}>
            <Save size={16} className="mr-1" /> Save Template
          </button>
          <button className="bg-green-500 text-white px-4 py-1 rounded flex items-center">
            <CheckSquare size={16} className="mr-1" /> Apply to All
          </button>
          <button className="bg-purple-500 text-white px-4 py-1 rounded flex items-center" onClick={handleExport}>
            <Download size={16} className="mr-1" /> Export Batch
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">Design Elements</h2>
          </div>

          <div className="p-2 flex space-x-1 border-b border-gray-200">
            <button
              className={`px-3 py-1 rounded text-sm ${activeTab === 'watermarks' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('watermarks')}
            >
              Watermarks
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${activeTab === 'shapes' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('shapes')}
            >
              Shapes
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${activeTab === 'icons' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('icons')}
            >
              Icons
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${activeTab === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveTab('text')}
            >
              Text
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {designElements[activeTab].map((element) => (
              <div
                key={element.id}
                className="p-3 mb-2 bg-gray-50 border border-gray-200 rounded cursor-move hover:border-blue-300 hover:bg-blue-50"
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
              >
                <div className="flex items-center">
                  {element.icon ? element.icon :
                    element.type === 'text' ? <Type size={24} /> :
                    element.type === 'image' ? <Image size={24} /> :
                    <Layers size={24} />
                  }
                  <span className="ml-2 text-sm">{element.name}</span>
                </div>
              </div>
            ))}

            {activeTab === 'watermarks' && (
              <label className="w-full p-2 mt-3 bg-blue-50 border border-blue-200 rounded text-blue-600 text-sm flex items-center justify-center cursor-pointer">
                <Upload size={14} className="mr-1" /> Upload Custom Watermark
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            )}

            {activeTab === 'icons' && (
              <label className="w-full p-2 mt-3 bg-blue-50 border border-blue-200 rounded text-blue-600 text-sm flex items-center justify-center cursor-pointer">
                <Upload size={14} className="mr-1" /> Upload Custom Icon
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-200 overflow-auto flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg transition-transform origin-center"
              style={{
                width: '800px',
                height: '600px',
                transform: `scale(${zoom / 100})`,
                backgroundImage: showGrid ? 'radial-gradient(#cbd5e1 1px, transparent 0)' : 'none',
                backgroundSize: '20px 20px',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {activeImage && (
                <img
                  src={activeImage.url}
                  alt={activeImage.name}
                  className="w-full h-full object-contain"
                />
              )}

              {elements.map((element, index) => (
                <div
                  key={index}
                  className="absolute bg-white bg-opacity-70 px-3 py-2 rounded shadow-sm cursor-move"
                  style={{ left: element.position.x, top: element.position.y }}
                >
                  <span className="text-gray-700 font-semibold opacity-70">{element.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2 border-t border-gray-300 bg-white flex items-center justify-between">
            <div className="flex space-x-1">
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setZoom(zoom => Math.max(zoom - 10, 10))}>
                <ZoomOut size={18} />
              </button>
              <div className="flex items-center px-1">
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="ml-2 text-sm text-gray-600">{zoom}%</span>
              </div>
              <button className="p-1 rounded hover:bg-gray-100" onClick={() => setZoom(zoom => Math.min(zoom + 10, 200))}>
                <ZoomIn size={18} />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <Move size={18} />
              </button>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <button className="p-1 rounded hover:bg-gray-100">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600">Image {images.findIndex(img => img.active) + 1} of {images.length}</span>
                <button className="p-1 rounded hover:bg-gray-100">
                  <ChevronRight size={18} />
                </button>
                <button className="p-1 ml-2 rounded hover:bg-gray-100">
                  <RotateCcw size={18} />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-16 border-t border-gray-300 bg-white p-1 flex items-center overflow-x-auto">
            {images.map(img => (
              <div
                key={img.id}
                className={`h-12 w-16 mx-1 rounded overflow-hidden cursor-pointer border-2 ${img.active ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                onClick={() => changeActiveImage(img.id)}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              </div>
            ))}
            <label className="h-12 w-16 mx-1 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded cursor-pointer">
              <Upload size={18} />
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700">Properties</h2>
          </div>

          {selectedElement ? (
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Size & Position</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">X Position</label>
                      <input type="number" className="w-full text-sm p-1 border border-gray-300 rounded" defaultValue="100" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Y Position</label>
                      <input type="number" className="w-full text-sm p-1 border border-gray-300 rounded" defaultValue="100" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width</label>
                      <input type="number" className="w-full text-sm p-1 border border-gray-300 rounded" defaultValue="100" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input type="number" className="w-full text-sm p-1 border border-gray-300 rounded" defaultValue="100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 flex-1 flex items-center justify-center text-gray-500">
              Select an element to view its properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
