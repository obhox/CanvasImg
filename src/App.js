import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './components/toolbar/Toolbar';
import Sidebar from './components/sidebar/Sidebar';
import Canvas from './components/canvas/Canvas';
import { DESIGN_ELEMENTS } from './utils/constants';

const App = () => {
  const [activeTab, setActiveTab] = useState('watermarks');
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [elements, setElements] = useState([]);
  const canvasRef = useRef(null);
  const [exportCanvas, setExportCanvas] = useState(null);

  // Main image state
  const [mainImage, setMainImage] = useState(null);
  
  // Watermark images state
  const [watermarks, setWatermarks] = useState([]);

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: element.type || 'shape',
      ...element
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const element = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      switch (element.type) {
        case 'text':
          setElements(prev => [...prev, {
            id: Date.now(),
            ...element,
            position: { x, y },
            content: element.name,
            fontSize: 16,
            color: '#000000'
          }]);
          break;
        case 'shape':
          setElements(prev => [...prev, {
            id: Date.now(),
            ...element,
            position: { x, y },
            size: { width: 100, height: 100 },
            color: '#000000',
            rotation: 0,
            scale: 1
          }]);
          break;
        default:
          console.log('Unknown element type:', element.type);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleZoom = (direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 10 : prev - 10;
      return Math.min(Math.max(newZoom, 50), 200);
    });
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, or SVG)');
      return;
    }

    const url = URL.createObjectURL(file);
    setMainImage({
      id: Date.now(),
      name: file.name,
      url,
      file
    });
  };

  const handleWatermarkUpload = (imageData) => {
    setWatermarks(prev => [...prev, {
      id: `watermark-${Date.now()}-${Math.random()}`,
      type: 'image',
      url: imageData,
      name: 'Watermark Image',
      position: { x: 0, y: 0 },
      scale: 1,
      opacity: 1,
      rotation: 0
    }]);
  };

  const handleTextWatermarkAdd = (textWatermark) => {
    const newWatermark = {
      id: Date.now(),
      type: 'text',
      ...textWatermark,
      position: { x: 50, y: 50 }, // Initial position
      scale: 1,
      rotation: 0
    };
    setWatermarks(prev => [...prev, newWatermark]);
  };

  const updateWatermarkPosition = (id, position) => {
    setWatermarks(prev => 
      prev.map(w => w.id === id ? { ...w, position } : w)
    );
  };

  const updateWatermarkProperties = (id, properties) => {
    setWatermarks(prev => prev.map(watermark => {
      if (watermark.id === id) {
        return {
          ...watermark,
          ...properties,
          // Normalize rotation to stay within 0-360 degrees
          ...(properties.rotation !== undefined && {
            rotation: ((properties.rotation % 360) + 360) % 360
          })
        };
      }
      return watermark;
    }));
  };

  const removeWatermark = (id) => {
    setWatermarks(prev => {
      const watermark = prev.find(w => w.id === id);
      if (watermark?.url) {
        try {
          const url = new URL(watermark.url);
          if (url.protocol === 'blob:') {
            URL.revokeObjectURL(watermark.url);
          }
        } catch (e) {
          console.error('Error cleaning up watermark URL:', e);
        }
      }
      return prev.filter(w => w.id !== id);
    });
  };

  const updateElementPosition = (id, position) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, position } : el
    ));
  };

  const updateElementProperties = (id, properties) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, ...properties } : el
    ));
  };

  const removeElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const handleSave = () => {
    // Placeholder for save functionality
    alert('Save functionality is not implemented yet.');
  };

  const handleExport = async () => {
    if (!exportCanvas) {
      alert('Canvas is not ready for export');
      return;
    }

    try {
      const dataUrl = await exportCanvas();
      const link = document.createElement('a');
      link.download = 'canvas-design.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting canvas:', error);
      alert('Failed to export canvas. Please try again.');
    }
  };

  const handleImageNavigation = (direction) => {
    // Removed this function as it's not being used
  };

  const changeActiveImage = (id) => {
    // Removed this function as it's not being used
  };

  const handleUpload = (e) => {
    // Removed this function as it's not being used
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    // Cleanup function to revoke object URLs on unmount
    return () => {
      // Clean up main image URL
      if (mainImage?.url) {
        try {
          const url = new URL(mainImage.url);
          if (url.protocol === 'blob:') {
            URL.revokeObjectURL(mainImage.url);
          }
        } catch (e) {
          console.error('Error cleaning up main image URL:', e);
        }
      }

      // Clean up watermark URLs
      watermarks.forEach(watermark => {
        if (watermark?.url) {
          try {
            const url = new URL(watermark.url);
            if (url.protocol === 'blob:') {
              URL.revokeObjectURL(watermark.url);
            }
          } catch (e) {
            console.error('Error cleaning up watermark URL:', e);
          }
        }
      });
    };
  }, [mainImage, watermarks]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onSave={handleSave}
        onExport={handleExport}
        onZoom={handleZoom}
        onUploadImage={handleMainImageUpload}
        hasMainImage={!!mainImage}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          designElements={DESIGN_ELEMENTS}
          handleDragStart={handleDragStart}
          onWatermarkUpload={handleWatermarkUpload}
          onTextWatermarkAdd={handleTextWatermarkAdd}
        />
        <Canvas
          canvasRef={canvasRef}
          zoom={zoom}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          mainImage={mainImage}
          watermarks={watermarks}
          elements={elements}
          updateWatermarkPosition={updateWatermarkPosition}
          updateWatermarkProperties={updateWatermarkProperties}
          updateElementPosition={updateElementPosition}
          updateElementProperties={updateElementProperties}
          removeWatermark={removeWatermark}
          removeElement={removeElement}
          onExport={setExportCanvas}
        />
      </div>
    </div>
  );
};

export default App;
