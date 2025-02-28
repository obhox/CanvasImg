import React, { useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Trash2, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

const Canvas = ({
  canvasRef,
  zoom,
  handleDrop,
  handleDragOver,
  mainImage,
  watermarks,
  elements,
  updateWatermarkPosition,
  updateWatermarkProperties,
  removeWatermark,
  updateElementPosition,
  updateElementProperties,
  removeElement,
  onExport,
  onElementSelect,
  onWatermarkSelect,
  showGrid,
  backgroundColor
}) => {
  const [selectedWatermark, setSelectedWatermark] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingType, setDraggingType] = useState(null); // 'watermark' or 'element'
  const [editingText, setEditingText] = useState(null);
  const [isCanvasSelected, setIsCanvasSelected] = useState(false);

  // Available fonts
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Courier New, monospace', label: 'Courier New' }
  ];

  // Update parent component when element is selected
  useEffect(() => {
    const element = elements.find(el => el.id === selectedElement);
    onElementSelect?.(element || null);
  }, [selectedElement, elements, onElementSelect]);

  // Update parent component when watermark is selected
  useEffect(() => {
    onWatermarkSelect?.(selectedWatermark);
  }, [selectedWatermark, onWatermarkSelect]);

  const handleWatermarkMouseDown = (e, watermark) => {
    e.stopPropagation();
    if (isDragging) return; // Prevent starting new drag while another is in progress
    setSelectedWatermark(watermark.id);
    setSelectedElement(null);
    setIsDragging(true);
    setDraggingType('watermark');
    setDragStart({
      x: e.clientX - watermark.position.x,
      y: e.clientY - watermark.position.y
    });
  };

  const handleElementMouseDown = (e, element) => {
    e.stopPropagation();
    if (isDragging) return; // Prevent starting new drag while another is in progress
    setSelectedElement(element.id);
    setSelectedWatermark(null);
    setIsDragging(true);
    setDraggingType('element');
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggingType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - dragStart.x, rect.width));
    const y = Math.max(0, Math.min(e.clientY - dragStart.y, rect.height));

    if (draggingType === 'watermark' && selectedWatermark) {
      updateWatermarkPosition(selectedWatermark, { x, y });
    } else if (draggingType === 'element' && selectedElement) {
      updateElementPosition(selectedElement, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingType(null);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedWatermark(null);
      setSelectedElement(null);
      onElementSelect?.({ type: 'canvas', color: backgroundColor });
      onWatermarkSelect?.(null);
      setIsCanvasSelected(true);
    }
  };

  const adjustWatermarkProperty = (id, property, delta) => {
    const watermark = watermarks.find(w => w.id === id);
    if (watermark) {
      let newValue;
      switch (property) {
        case 'scale':
          newValue = Math.max(0.1, Math.min(2, watermark.scale + delta));
          break;
        case 'opacity':
          newValue = Math.max(0.1, Math.min(1, watermark.opacity + delta));
          break;
        case 'rotation':
          newValue = (watermark.rotation || 0) + delta;
          break;
        default:
          return;
      }
      updateWatermarkProperties(id, { [property]: newValue });
    }
  };

  const adjustElementProperty = (id, property, delta) => {
    const element = elements?.find(e => e.id === id);
    if (element) {
      let newValue;
      switch (property) {
        case 'scale':
          newValue = Math.max(0.1, Math.min(2, (element.scale || 1) + delta));
          break;
        case 'rotation':
          newValue = ((element.rotation || 0) + delta) % 360;
          break;
        case 'fontSize':
          newValue = Math.max(8, Math.min(72, (element.fontSize || 24) + delta));
          break;
        default:
          return;
      }
      updateElementProperties(id, { [property]: newValue });
    }
  };

  const handleTextChange = (id, newText) => {
    updateElementProperties(id, { text: newText });
  };

  const handleTextDoubleClick = (e, element) => {
    e.stopPropagation();
    if (element.type === 'text') {
      setEditingText(element.id);
    }
  };

  const handleTextBlur = () => {
    setEditingText(null);
  };

  const handleFontChange = (id, fontFamily, isWatermark = false) => {
    if (isWatermark) {
      updateWatermarkProperties(id, { fontFamily });
    } else {
      updateElementProperties(id, { fontFamily });
    }
  };

  const handleFontSizeChange = (id, fontSize, isWatermark = false) => {
    const size = Math.max(8, Math.min(72, parseInt(fontSize) || 24));
    if (isWatermark) {
      updateWatermarkProperties(id, { fontSize: size });
    } else {
      updateElementProperties(id, { fontSize: size });
    }
  };

  const handleColorChange = (id, color, isWatermark = false) => {
    if (isWatermark) {
      updateWatermarkProperties(id, { color });
    } else {
      updateElementProperties(id, { color });
    }
  };

  const exportCanvas = useCallback((customWidth = 800, customHeight = 600) => {
    console.log('Starting canvas export...');
    return new Promise(async (resolve, reject) => {
      try {
        // Create a new canvas for export
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        
        // Set canvas size to the requested dimensions
        exportCanvas.width = customWidth;
        exportCanvas.height = customHeight;

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Helper function to load image
        const loadImage = (url) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (error) => {
              console.error('Error loading image:', error);
              reject(error);
            };
            img.src = url;
          });
        };

        try {
          // Draw main image if exists
          if (mainImage) {
            console.log('Drawing main image...');
            const img = await loadImage(mainImage.url);
            ctx.drawImage(img, 0, 0, exportCanvas.width, exportCanvas.height);
            console.log('Main image drawn');
          }

          // Calculate scale factors for the new dimensions
          const scaleX = customWidth / 800;
          const scaleY = customHeight / 600;

          // Draw elements with proper scaling
          if (elements?.length) {
            console.log('Drawing elements...');
            for (const element of elements) {
              ctx.save();
              // Scale position according to new dimensions
              ctx.translate(element.position.x * scaleX, element.position.y * scaleY);
              // Scale size according to new dimensions while maintaining relative scale
              ctx.scale((element.scale || 1) * scaleX, (element.scale || 1) * scaleY);
              ctx.rotate((element.rotation || 0) * Math.PI / 180);

              if (element.type === 'text') {
                // Scale font size according to new dimensions
                const scaledFontSize = element.fontSize * Math.min(scaleX, scaleY);
                ctx.font = `${scaledFontSize}px ${element.fontFamily || 'Arial, sans-serif'}`;
                ctx.fillStyle = element.color || '#000000';
                ctx.fillText(element.text, 0, scaledFontSize);
              } else if (element.shape) {
                ctx.fillStyle = element.color;
                const scaledWidth = element.size.width * scaleX;
                const scaledHeight = element.size.height * scaleY;
                
                // Save the current context state
                ctx.save();
                
                // Center the shape in its bounding box
                ctx.translate(scaledWidth / 2, scaledHeight / 2);
                
                switch (element.shape) {
                  case 'rectangle':
                    ctx.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                    break;
                    
                  case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, scaledWidth / 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                  case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -scaledHeight / 2);
                    ctx.lineTo(scaledWidth / 2, scaledHeight / 2);
                    ctx.lineTo(-scaledWidth / 2, scaledHeight / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'star':
                    ctx.beginPath();
                    const spikes = 5;
                    const outerRadius = scaledWidth / 2;
                    const innerRadius = outerRadius * 0.4;
                    for (let i = 0; i < spikes * 2; i++) {
                      const radius = i % 2 === 0 ? outerRadius : innerRadius;
                      const angle = (i * Math.PI) / spikes;
                      if (i === 0) {
                        ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      } else {
                        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      }
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'hexagon':
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                      const angle = (i * Math.PI) / 3;
                      const radius = scaledWidth / 2;
                      if (i === 0) {
                        ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      } else {
                        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      }
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'pentagon':
                    ctx.beginPath();
                    for (let i = 0; i < 5; i++) {
                      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                      const radius = scaledWidth / 2;
                      if (i === 0) {
                        ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      } else {
                        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      }
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'octagon':
                    ctx.beginPath();
                    for (let i = 0; i < 8; i++) {
                      const angle = (i * Math.PI) / 4;
                      const radius = scaledWidth / 2;
                      if (i === 0) {
                        ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      } else {
                        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                      }
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'diamond':
                    ctx.beginPath();
                    ctx.moveTo(0, -scaledHeight / 2);
                    ctx.lineTo(scaledWidth / 2, 0);
                    ctx.lineTo(0, scaledHeight / 2);
                    ctx.lineTo(-scaledWidth / 2, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                  case 'line':
                    ctx.beginPath();
                    ctx.lineWidth = 4 * Math.min(scaleX, scaleY);
                    ctx.strokeStyle = element.color || '#000000';
                    ctx.moveTo(-scaledWidth / 2, 0);
                    ctx.lineTo(scaledWidth / 2, 0);
                    ctx.stroke();
                    break;
                }
                
                // Restore the context state
                ctx.restore();
              }
              ctx.restore();
            }
          }

          // Draw watermarks with proper scaling
          if (watermarks?.length) {
            console.log('Drawing watermarks...');
            for (const watermark of watermarks) {
              ctx.save();
              ctx.globalAlpha = watermark.opacity || 1;
              // Scale position according to new dimensions
              ctx.translate(watermark.position.x * scaleX, watermark.position.y * scaleY);
              // Scale size according to new dimensions while maintaining relative scale
              ctx.scale((watermark.scale || 1) * scaleX, (watermark.scale || 1) * scaleY);
              ctx.rotate((watermark.rotation || 0) * Math.PI / 180);

              if (watermark.url) {
                try {
                  const img = await loadImage(watermark.url);
                  // Scale watermark image while maintaining aspect ratio
                  const aspectRatio = img.width / img.height;
                  const maxSize = 200 * Math.min(scaleX, scaleY);
                  const width = Math.min(maxSize, img.width * scaleX);
                  const height = width / aspectRatio;
                  ctx.drawImage(img, 0, 0, width, height);
                } catch (error) {
                  console.error('Error drawing watermark image:', error);
                }
              }
              ctx.restore();
            }
          }

          // Generate final image with maximum quality
          console.log('All drawing completed, generating final image...');
          const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
          console.log('Data URL generated successfully');
          resolve(dataUrl);

        } catch (error) {
          console.error('Error during drawing:', error);
          reject(error);
        }
      } catch (error) {
        console.error('Error in export process:', error);
        reject(error);
      }
    });
  }, [mainImage, elements, watermarks]);

  // Connect the export function to the parent component
  useEffect(() => {
    console.log('Canvas: Setting up export function...');
    if (typeof onExport === 'function') {
      console.log('Canvas: Passing export function to parent');
      onExport(exportCanvas);
    } else {
      console.warn('Canvas: onExport is not a function:', onExport);
    }
  }, [exportCanvas, onExport]);

  // Add function to update canvas background color
  const updateCanvasBackground = (color) => {
    // This function is no longer used in the new implementation
  };

  return (
    <div className="flex-1 bg-gray-200 flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div
          ref={canvasRef}
          className="bg-white shadow-lg relative flex-shrink-0"
          style={{
            width: '800px',
            height: '600px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            backgroundColor: backgroundColor
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Layer */}
          {showGrid && (
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }} />
            </div>
          )}
          
          {mainImage && (
            <img
              src={mainImage.url}
              alt={mainImage.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* Elements Layer */}
          <div className="absolute inset-0">
            {elements?.map((element) => (
              <div
                key={`element-${element.id}`}
                className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  transform: `scale(${element.scale || 1}) rotate(${element.rotation || 0}deg)`,
                  transformOrigin: 'center',
                  ...(element.type !== 'text' && {
                    width: element.size?.width || 100,
                    height: element.size?.height || 100
                  }),
                  zIndex: selectedElement === element.id ? 20 : 10
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onDoubleClick={(e) => handleTextDoubleClick(e, element)}
              >
                {element.type === 'text' ? (
                  editingText === element.id ? (
                    <input
                      type="text"
                      value={element.text}
                      onChange={(e) => handleTextChange(element.id, e.target.value)}
                      onBlur={handleTextBlur}
                      autoFocus
                      className="bg-transparent border-none outline-none"
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily || 'Arial, sans-serif',
                        fontWeight: element.fontWeight || 'normal',
                        fontStyle: element.fontStyle || 'normal',
                        textDecoration: element.textDecoration || 'none',
                        color: element.color,
                        opacity: element.opacity || 1,
                        width: 'auto',
                        minWidth: '50px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily || 'Arial, sans-serif',
                        fontWeight: element.fontWeight || 'normal',
                        fontStyle: element.fontStyle || 'normal',
                        textDecoration: element.textDecoration || 'none',
                        color: element.color,
                        opacity: element.opacity || 1,
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        textAlign: element.textAlign || 'left'
                      }}
                    >
                      {element.text}
                    </div>
                  )
                ) : element.shape === 'rectangle' ? (
                  <div 
                    className="w-full h-full rounded-md" 
                    style={{ 
                      backgroundColor: element.color || '#3B82F6',
                      opacity: element.opacity || 1
                    }}
                  />
                ) : element.shape === 'circle' ? (
                  <div 
                    className="w-full h-full rounded-full" 
                    style={{ 
                      backgroundColor: element.color || '#22C55E',
                      opacity: element.opacity || 1
                    }}
                  />
                ) : element.shape === 'triangle' ? (
                  <div className="w-full h-full overflow-hidden">
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: `${element.size?.width / 2 || 50}px solid transparent`,
                        borderRight: `${element.size?.width / 2 || 50}px solid transparent`,
                        borderBottom: `${element.size?.height || 100}px solid ${element.color || '#F59E0B'}`,
                        opacity: element.opacity || 1
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className={`w-full h-full ${element.shape}-shape`}
                    style={{ 
                      backgroundColor: element.color || '#3B82F6',
                      opacity: element.opacity || 1
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Watermarks Layer */}
          <div className="absolute inset-0">
            {watermarks.map((watermark) => (
              <div
                key={`watermark-${watermark.id}`}
                className={`absolute cursor-move ${selectedWatermark === watermark.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: `${watermark.position.x}px`,
                  top: `${watermark.position.y}px`,
                  transform: `scale(${watermark.scale || 1}) rotate(${watermark.rotation || 0}deg)`,
                  opacity: watermark.opacity,
                  transformOrigin: 'center center',
                  zIndex: selectedWatermark === watermark.id ? 40 : 30,
                  pointerEvents: isDragging && draggingType === 'element' ? 'none' : 'auto'
                }}
                onMouseDown={(e) => handleWatermarkMouseDown(e, watermark)}
              >
                <img
                  src={watermark.url}
                  alt={watermark.name}
                  className="max-w-[200px] max-h-[200px] object-contain select-none"
                  draggable={false}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
