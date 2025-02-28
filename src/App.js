import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './components/toolbar/Toolbar';
import Sidebar from './components/sidebar/Sidebar';
import Canvas from './components/canvas/Canvas';
import CanvasMenu from './components/canvas/CanvasMenu';
import ExportButton from './components/ui/ExportButton';
import { DESIGN_ELEMENTS } from './utils/constants';
import JSZip from 'jszip';
import { Trash2 } from 'lucide-react';

const THUMBNAIL_UPDATE_DELAY = 500; // ms

const App = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedWatermark, setSelectedWatermark] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [canvases, setCanvases] = useState(() => {
    try {
      const savedCanvases = localStorage.getItem('canvases');
      return savedCanvases ? JSON.parse(savedCanvases) : [
        {
          id: 'default',
          mainImage: null,
          elements: [],
          watermarks: []
        }
      ];
    } catch (error) {
      console.error('Error loading canvases from localStorage:', error);
      return [{
        id: 'default',
        mainImage: null,
        elements: [],
        watermarks: []
      }];
    }
  });
  const [activeCanvasIndex, setActiveCanvasIndex] = useState(0);
  const canvasRef = useRef(null);
  const [exportFunction, setExportFunction] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const thumbnailCanvasRef = useRef(document.createElement('canvas'));
  const thumbnailTimeoutRef = useRef(null);

  // Save canvases to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('canvases', JSON.stringify(canvases));
    } catch (error) {
      console.error('Error saving canvases to localStorage:', error);
    }
  }, [canvases]);

  const handleDragStart = (e, element) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: element.type || 'shape',
      ...element
    }));
  };

  const generateUniqueId = () => {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const handleMainImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('Please upload valid image files (PNG, JPG, JPEG, or SVG)');
      return;
    }

    // Create new canvases for each image
    const newCanvases = files.map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: generateUniqueId(),
        mainImage: {
          id: generateUniqueId(),
          name: file.name,
          url,
          file
        },
        elements: [],
        watermarks: []
      };
    });

    // If there's only a default empty canvas, replace it
    if (canvases.length === 1 && !canvases[0].mainImage) {
      setCanvases(newCanvases);
    } else {
      // Otherwise, append new canvases
      setCanvases(prev => [...prev, ...newCanvases]);
    }

    // Set active canvas to the first new one
    setActiveCanvasIndex(canvases.length === 1 && !canvases[0].mainImage ? 0 : canvases.length);
  };

  const handleCanvasChange = (index) => {
    setActiveCanvasIndex(index);
    setSelectedElement(null);
  };

  const removeCanvas = (index) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      // Clean up the URL of the removed canvas
      const removedCanvas = newCanvases[index];
      if (removedCanvas.mainImage?.url) {
        URL.revokeObjectURL(removedCanvas.mainImage.url);
      }
      newCanvases.splice(index, 1);
      
      // If removing the last canvas, create a new empty one
      if (newCanvases.length === 0) {
        newCanvases.push({
          id: 'default',
          mainImage: null,
          elements: [],
          watermarks: []
        });
      }
      
      // Adjust active canvas index if necessary
      if (index <= activeCanvasIndex) {
        setActiveCanvasIndex(Math.max(0, Math.min(activeCanvasIndex - 1, newCanvases.length - 1)));
      }
      
      return newCanvases;
    });
  };

  const activeCanvas = canvases[activeCanvasIndex];

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const element = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCanvases(prev => {
        const newCanvases = [...prev];
        const canvas = newCanvases[activeCanvasIndex];
        const newId = generateUniqueId();

        switch (element.type) {
          case 'text':
            // Check if text already exists
            const textExists = canvas.elements.some(el => 
              el.type === 'text' && el.text === element.name && 
              el.position.x === x && el.position.y === y
            );
            if (!textExists) {
              canvas.elements = [...canvas.elements, {
                id: newId,
                type: 'text',
                position: { x, y },
                text: element.name,
                fontSize: element.fontSize || 24,
                fontFamily: element.fontFamily || 'Arial, sans-serif',
                fontWeight: element.fontWeight || 'normal',
                color: element.color || '#000000',
                scale: 1,
                rotation: 0
              }];
            }
            break;
          case 'shape':
            // Check if shape already exists
            const shapeExists = canvas.elements.some(el =>
              el.type === 'shape' && el.shape === element.shape &&
              el.position.x === x && el.position.y === y
            );
            if (!shapeExists) {
              const defaultColors = {
                rectangle: '#3B82F6',
                circle: '#22C55E',
                triangle: '#F59E0B'
              };
              canvas.elements = [...canvas.elements, {
                id: newId,
                type: 'shape',
                shape: element.shape,
                position: { x, y },
                size: { width: 100, height: 100 },
                color: element.color || defaultColors[element.shape] || '#3B82F6',
                scale: 1,
                rotation: 0
              }];
            }
            break;
          case 'image':
            // Find the image in uploadedImages
            const imageRef = uploadedImages.find(img => img.id === element.imageId);
            if (imageRef) {
              // Check if this image is already on the canvas
              const isAlreadyOnCanvas = canvas.watermarks.some(
                w => w.imageId === imageRef.id &&
                w.position.x === x && w.position.y === y
              );

              if (!isAlreadyOnCanvas) {
                canvas.watermarks = [...canvas.watermarks, {
                  id: newId,
                  type: 'image',
                  imageId: imageRef.id,
                  url: imageRef.url,
                  name: imageRef.name,
                  position: { x, y },
                  scale: 1,
                  opacity: 1,
                  rotation: 0
                }];
              }
            }
            break;
        }

        return newCanvases;
      });
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

  const handleWatermarkUpload = (imageData) => {
    // Check if image already exists
    const existingImage = uploadedImages.find(img => img.url === imageData);
    
    // Create the watermark object with position at canvas center
    const canvasElement = canvasRef.current;
    const rect = canvasElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (existingImage) {
      // If image exists, check if it's already on the canvas
      const isAlreadyOnCanvas = canvases[activeCanvasIndex].watermarks.some(
        w => w.imageId === existingImage.id
      );

      if (isAlreadyOnCanvas) {
        return; // Don't add if already on canvas
      }

      // Add new watermark reference
      setCanvases(prev => {
        const newCanvases = [...prev];
        const canvas = newCanvases[activeCanvasIndex];
        
        // Check if a watermark already exists at this position
        const positionTaken = canvas.watermarks.some(w => 
          w.position.x === centerX - 50 && w.position.y === centerY - 50
        );

        // If position is taken, offset the new watermark slightly
        const position = positionTaken ? {
          x: centerX - 50 + 20,
          y: centerY - 50 + 20
        } : {
          x: centerX - 50,
          y: centerY - 50
        };
        
        canvas.watermarks = [...canvas.watermarks, {
          id: generateUniqueId(),
          type: 'image',
          imageId: existingImage.id,
          url: existingImage.url,
          name: existingImage.name,
          position,
          scale: 1,
          opacity: 1,
          rotation: 0
        }];

        return newCanvases;
      });
    } else {
      // If image doesn't exist, create new image and watermark
      const newImageId = generateUniqueId();
      const newImage = {
        id: newImageId,
        url: imageData,
        name: 'Uploaded Image'
      };

      setUploadedImages(prev => [...prev, newImage]);
      
      setCanvases(prev => {
        const newCanvases = [...prev];
        const canvas = newCanvases[activeCanvasIndex];
        
        // Check if a watermark already exists at this position
        const positionTaken = canvas.watermarks.some(w => 
          w.position.x === centerX - 50 && w.position.y === centerY - 50
        );

        // If position is taken, offset the new watermark slightly
        const position = positionTaken ? {
          x: centerX - 50 + 20,
          y: centerY - 50 + 20
        } : {
          x: centerX - 50,
          y: centerY - 50
        };
        
        canvas.watermarks = [...canvas.watermarks, {
          id: generateUniqueId(),
          type: 'image',
          imageId: newImageId,
          url: newImage.url,
          name: newImage.name,
          position,
          scale: 1,
          opacity: 1,
          rotation: 0
        }];

        return newCanvases;
      });
    }
  };

  const updateElementPosition = (id, position) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.elements = canvas.elements.map(el => 
        el.id === id ? { ...el, position } : el
      );
      return newCanvases;
    });
  };

  const updateElementProperties = (id, properties) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.elements = canvas.elements.map(el => 
        el.id === id ? { ...el, ...properties } : el
      );
      return newCanvases;
    });
  };

  const removeElement = (id) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.elements = canvas.elements.filter(el => el.id !== id);
      return newCanvases;
    });
  };

  const updateWatermarkPosition = (id, position) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.watermarks = canvas.watermarks.map(w => 
        w.id === id ? { ...w, position } : w
      );
      return newCanvases;
    });
  };

  const updateWatermarkProperties = (id, properties) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.watermarks = canvas.watermarks.map(w => {
        if (w.id === id) {
          return {
            ...w,
            ...properties,
            ...(properties.rotation !== undefined && {
              rotation: ((properties.rotation % 360) + 360) % 360
            })
          };
        }
        return w;
      });
      return newCanvases;
    });
  };

  const removeWatermark = (id) => {
    setCanvases(prev => {
      const newCanvases = [...prev];
      const canvas = newCanvases[activeCanvasIndex];
      canvas.watermarks = canvas.watermarks.filter(w => w.id !== id);
      return newCanvases;
    });
  };

  const removeUploadedImage = (imageId) => {
    // Remove the image from uploadedImages
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // Remove all watermarks that use this image
    setCanvases(prev => {
      return prev.map(canvas => ({
        ...canvas,
        watermarks: canvas.watermarks.filter(w => w.imageId !== imageId)
      }));
    });
  };

  const handleExport = useCallback(() => {
    console.log('App: handleExport called');
    if (typeof exportFunction !== 'function') {
      console.error('Export function not available:', exportFunction);
      return Promise.reject('Export function not ready');
    }
    return exportFunction();
  }, [exportFunction]);

  const setExportFunctionCallback = useCallback((fn) => {
    console.log('App: Setting export function');
    setExportFunction(() => fn);
  }, []);

  const handleBatchExport = useCallback(async () => {
    if (!exportFunction) {
      alert('Export function not ready');
      return;
    }

    try {
      const zip = new JSZip();
      
      // Export each canvas
      for (let i = 0; i < canvases.length; i++) {
        // Temporarily switch to the canvas we want to export
        const tempActiveIndex = activeCanvasIndex;
        setActiveCanvasIndex(i);
        
        // Wait for the state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const dataUrl = await exportFunction();
          if (!dataUrl) continue;

          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const canvas = canvases[i];
          const filename = canvas.mainImage?.name 
            ? `canvas-${canvas.mainImage.name}.png`
            : `canvas-${i + 1}.png`;
          
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Error exporting canvas ${i}:`, error);
        }
      }
      
      // Restore the original active canvas
      setActiveCanvasIndex(activeCanvasIndex);

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `canvas-designs-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error during batch export:', error);
      alert('Failed to export all canvases. Please try again.');
    }
  }, [canvases, activeCanvasIndex, exportFunction]);

  const handleSave = () => {
    try {
      const savedData = {
        canvases,
        activeCanvasIndex,
        zoom,
        showGrid
      };
      
      const dataStr = JSON.stringify(savedData);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportName = 'canvas-template.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const generateThumbnail = async (canvas) => {
    const thumbnailCanvas = thumbnailCanvasRef.current;
    const ctx = thumbnailCanvas.getContext('2d');
    
    // Set thumbnail dimensions
    thumbnailCanvas.width = 192; // 24px * 8 for better quality
    thumbnailCanvas.height = 144; // maintain 4:3 ratio
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    
    try {
      // Draw main image if exists
      if (canvas.mainImage) {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = canvas.mainImage.url;
        });
        ctx.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      }

      // Draw elements
      canvas.elements.forEach(element => {
        const scale = thumbnailCanvas.width / 800; // Scale based on main canvas width
        ctx.save();
        ctx.translate(element.position.x * scale, element.position.y * scale);
        ctx.scale(element.scale * scale, element.scale * scale);
        ctx.rotate((element.rotation || 0) * Math.PI / 180);

        if (element.type === 'text') {
          ctx.font = `${element.fontSize * scale}px ${element.fontFamily}`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, 0, element.fontSize * scale);
        } else if (element.shape) {
          ctx.fillStyle = element.color;
          switch (element.shape) {
            case 'rectangle':
              ctx.fillRect(0, 0, element.size.width * scale, element.size.height * scale);
              break;
            case 'circle':
              ctx.beginPath();
              ctx.arc(
                element.size.width * scale / 2,
                element.size.height * scale / 2,
                element.size.width * scale / 2,
                0,
                Math.PI * 2
              );
              ctx.fill();
              break;
            case 'triangle':
              ctx.beginPath();
              ctx.moveTo(element.size.width * scale / 2, 0);
              ctx.lineTo(element.size.width * scale, element.size.height * scale);
              ctx.lineTo(0, element.size.height * scale);
              ctx.closePath();
              ctx.fill();
              break;
          }
        }
        ctx.restore();
      });

      // Draw watermarks
      for (const watermark of canvas.watermarks) {
        const scale = thumbnailCanvas.width / 800;
        ctx.save();
        ctx.globalAlpha = watermark.opacity;
        ctx.translate(watermark.position.x * scale, watermark.position.y * scale);
        ctx.scale(watermark.scale * scale, watermark.scale * scale);
        ctx.rotate((watermark.rotation || 0) * Math.PI / 180);

        if (watermark.type === 'text') {
          ctx.font = `${watermark.fontSize * scale}px ${watermark.fontFamily}`;
          ctx.fillStyle = watermark.color;
          ctx.fillText(watermark.text, 0, watermark.fontSize * scale);
        } else {
          const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = watermark.url;
          });
          ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        }
        ctx.restore();
      }

      return thumbnailCanvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  // Update thumbnails when canvases change
  useEffect(() => {
    // Clear previous timeout
    if (thumbnailTimeoutRef.current) {
      clearTimeout(thumbnailTimeoutRef.current);
    }

    // Debounce thumbnail generation
    thumbnailTimeoutRef.current = setTimeout(async () => {
      const newThumbnails = { ...thumbnails };
      const oldThumbnails = { ...thumbnails };

      try {
        for (const canvas of canvases) {
          const thumbnail = await generateThumbnail(canvas);
          if (thumbnail) {
            newThumbnails[canvas.id] = thumbnail;
          }
        }

        // Cleanup old thumbnails
        Object.keys(oldThumbnails).forEach(id => {
          if (!canvases.find(canvas => canvas.id === id)) {
            URL.revokeObjectURL(oldThumbnails[id]);
          }
        });

        setThumbnails(newThumbnails);
      } catch (error) {
        console.error('Error updating thumbnails:', error);
      }
    }, THUMBNAIL_UPDATE_DELAY);

    return () => {
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current);
      }
    };
  }, [canvases]);

  // Cleanup thumbnails when component unmounts
  useEffect(() => {
    return () => {
      Object.values(thumbnails).forEach(thumbnail => {
        try {
          URL.revokeObjectURL(thumbnail);
        } catch (error) {
          console.error('Error cleaning up thumbnail:', error);
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onSave={handleSave}
        onZoom={handleZoom}
        onUploadImage={handleMainImageUpload}
        hasMainImage={!!activeCanvas.mainImage}
        onClearCanvas={() => removeCanvas(activeCanvasIndex)}
        onExport={handleExport}
        onBatchExport={handleBatchExport}
        hasBatchExport={canvases.length > 1}
        canvasCount={canvases.length}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          designElements={DESIGN_ELEMENTS}
          handleDragStart={handleDragStart}
          onWatermarkUpload={handleWatermarkUpload}
          uploadedImages={uploadedImages}
          onRemoveImage={removeUploadedImage}
          selectedElement={selectedElement}
          updateElementProperties={updateElementProperties}
        />
        <div className="flex flex-col flex-1">
          <CanvasMenu
            selectedElement={selectedElement}
            selectedWatermark={selectedWatermark}
            watermarks={activeCanvas.watermarks}
            updateElementProperties={updateElementProperties}
            updateWatermarkProperties={updateWatermarkProperties}
            removeElement={removeElement}
            removeWatermark={removeWatermark}
          />
          {/* Main Canvas Area */}
          <div className="flex-1 relative bg-gray-100">
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                width: '100%',
                height: '100%'
              }}
            >
              <div className="relative flex-shrink-0 bg-white" style={{
                width: '800px',
                height: '600px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-out',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div className="absolute inset-0 bg-white" />
                <div className="absolute top-2 right-2 z-50 flex gap-2">
                  <button
                    className="p-1 bg-white/80 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                    onClick={() => removeCanvas(activeCanvasIndex)}
                    title="Delete Canvas"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-sm">
                  Canvas {activeCanvasIndex + 1}
                </div>
                <Canvas
                  canvasRef={canvasRef}
                  zoom={zoom}
                  handleDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  mainImage={activeCanvas.mainImage}
                  watermarks={activeCanvas.watermarks}
                  elements={activeCanvas.elements}
                  updateWatermarkPosition={updateWatermarkPosition}
                  updateWatermarkProperties={updateWatermarkProperties}
                  removeWatermark={removeWatermark}
                  updateElementPosition={updateElementPosition}
                  updateElementProperties={updateElementProperties}
                  removeElement={removeElement}
                  onExport={setExportFunctionCallback}
                  onElementSelect={setSelectedElement}
                  onWatermarkSelect={setSelectedWatermark}
                />
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {canvases.length > 1 && (
            <div className="h-24 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="h-full overflow-x-auto">
                <div className="flex gap-4 p-2 min-w-max">
                  {canvases.map((canvas, index) => (
                    <div
                      key={canvas.id}
                      className={`relative cursor-pointer group ${
                        index === activeCanvasIndex ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-300'
                      }`}
                      onClick={() => handleCanvasChange(index)}
                    >
                      <div className="w-24 h-18 bg-white shadow-sm overflow-hidden">
                        {thumbnails[canvas.id] ? (
                          <img
                            src={thumbnails[canvas.id]}
                            alt={`Canvas ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                            Empty Canvas
                          </div>
                        )}
                      </div>
                      <button
                        className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCanvas(index);
                        }}
                        title="Delete Canvas"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
