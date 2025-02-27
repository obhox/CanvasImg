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
  onExport
}) => {
  const [selectedWatermark, setSelectedWatermark] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingType, setDraggingType] = useState(null); // 'watermark' or 'element'
  const [editingText, setEditingText] = useState(null);

  // Available fonts
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Courier New, monospace', label: 'Courier New' }
  ];

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
    // Only clear selection if clicking directly on the canvas
    if (e.target === canvasRef.current) {
      setSelectedWatermark(null);
      setSelectedElement(null);
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

  const exportCanvas = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const canvasElement = canvasRef.current;
        
        // Set canvas size to match the design area
        canvas.width = 800;
        canvas.height = 600;

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // If there's a main image, draw it first
        if (mainImage) {
          const img = new Image();
          img.src = mainImage.url;
          
          img.onload = () => {
            // Draw main image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Draw all watermarks
            let watermarkPromises = watermarks.map(watermark => {
              return new Promise((resolve) => {
                if (watermark.type === 'text') {
                  // Draw text watermark
                  ctx.save();
                  ctx.globalAlpha = watermark.opacity;
                  ctx.translate(watermark.position.x, watermark.position.y);
                  ctx.scale(watermark.scale, watermark.scale);
                  ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                  
                  ctx.font = `${watermark.fontSize}px sans-serif`;
                  ctx.fillStyle = watermark.color;
                  ctx.fillText(watermark.text, 0, watermark.fontSize);
                  ctx.restore();
                  resolve();
                } else {
                  // Draw image watermark
                  const watermarkImg = new Image();
                  watermarkImg.src = watermark.url;
                  watermarkImg.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = watermark.opacity;
                    ctx.translate(watermark.position.x, watermark.position.y);
                    ctx.scale(watermark.scale, watermark.scale);
                    ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                    ctx.drawImage(watermarkImg, 0, 0);
                    ctx.restore();
                    resolve();
                  };
                  watermarkImg.onerror = () => {
                    console.error('Error loading watermark image');
                    resolve();
                  };
                }
              });
            });

            Promise.all(watermarkPromises)
              .then(() => {
                resolve(canvas.toDataURL('image/png'));
              })
              .catch(error => {
                console.error('Error drawing watermarks:', error);
                reject(error);
              });
          };

          img.onerror = (error) => {
            console.error('Error loading main image:', error);
            // If main image fails, still try to draw watermarks on white background
            let watermarkPromises = watermarks.map(watermark => {
              return new Promise((resolve) => {
                if (watermark.type === 'text') {
                  ctx.save();
                  ctx.globalAlpha = watermark.opacity;
                  ctx.translate(watermark.position.x, watermark.position.y);
                  ctx.scale(watermark.scale, watermark.scale);
                  ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                  ctx.font = `${watermark.fontSize}px sans-serif`;
                  ctx.fillStyle = watermark.color;
                  ctx.fillText(watermark.text, 0, watermark.fontSize);
                  ctx.restore();
                  resolve();
                } else {
                  const watermarkImg = new Image();
                  watermarkImg.src = watermark.url;
                  watermarkImg.onload = () => {
                    ctx.save();
                    ctx.globalAlpha = watermark.opacity;
                    ctx.translate(watermark.position.x, watermark.position.y);
                    ctx.scale(watermark.scale, watermark.scale);
                    ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                    ctx.drawImage(watermarkImg, 0, 0);
                    ctx.restore();
                    resolve();
                  };
                  watermarkImg.onerror = () => {
                    console.error('Error loading watermark image');
                    resolve();
                  };
                }
              });
            });

            Promise.all(watermarkPromises)
              .then(() => {
                resolve(canvas.toDataURL('image/png'));
              })
              .catch(error => {
                console.error('Error drawing watermarks:', error);
                reject(error);
              });
          };
        } else {
          // No main image, just draw watermarks on white background
          let watermarkPromises = watermarks.map(watermark => {
            return new Promise((resolve) => {
              if (watermark.type === 'text') {
                ctx.save();
                ctx.globalAlpha = watermark.opacity;
                ctx.translate(watermark.position.x, watermark.position.y);
                ctx.scale(watermark.scale, watermark.scale);
                ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                ctx.font = `${watermark.fontSize}px sans-serif`;
                ctx.fillStyle = watermark.color;
                ctx.fillText(watermark.text, 0, watermark.fontSize);
                ctx.restore();
                resolve();
              } else {
                const watermarkImg = new Image();
                watermarkImg.src = watermark.url;
                watermarkImg.onload = () => {
                  ctx.save();
                  ctx.globalAlpha = watermark.opacity;
                  ctx.translate(watermark.position.x, watermark.position.y);
                  ctx.scale(watermark.scale, watermark.scale);
                  ctx.rotate((watermark.rotation || 0) * Math.PI / 180);
                  ctx.drawImage(watermarkImg, 0, 0);
                  ctx.restore();
                  resolve();
                };
                watermarkImg.onerror = () => {
                  console.error('Error loading watermark image');
                  resolve();
                };
              }
            });
          });

          Promise.all(watermarkPromises)
            .then(() => {
              resolve(canvas.toDataURL('image/png'));
            })
            .catch(error => {
              console.error('Error drawing watermarks:', error);
              reject(error);
            });
        }
      } catch (error) {
        console.error('Error in export process:', error);
        reject(error);
      }
    });
  }, [canvasRef, mainImage, watermarks]);

  // Connect the export function to the parent component
  useEffect(() => {
    if (onExport) {
      onExport(exportCanvas);
    }
  }, [exportCanvas, onExport]);

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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* White background layer */}
          <div className="absolute inset-0 bg-white" />
          
          {mainImage && (
            <img
              src={mainImage.url}
              alt={mainImage.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {elements?.map((element) => (
            <React.Fragment key={element.id}>
              <div
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
                        fontWeight: element.fontWeight,
                        color: element.color,
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
                        fontWeight: element.fontWeight,
                        color: element.color,
                        whiteSpace: 'nowrap',
                        userSelect: 'none'
                      }}
                    >
                      {element.text}
                    </div>
                  )
                ) : element.shape === 'rectangle' ? (
                  <div className="w-full h-full bg-blue-500 rounded-md" />
                ) : element.shape === 'circle' ? (
                  <div className="w-full h-full bg-green-500 rounded-full" />
                ) : element.shape === 'triangle' && (
                  <div className="w-full h-full overflow-hidden">
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: `${element.size?.width / 2 || 50}px solid transparent`,
                        borderRight: `${element.size?.width / 2 || 50}px solid transparent`,
                        borderBottom: `${element.size?.height || 100}px solid #f59e0b`
                      }}
                    />
                  </div>
                )}
              </div>
              
              {selectedElement === element.id && element.type === 'text' && (
                <div 
                  className="absolute bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-50"
                  style={{
                    left: `${element.position.x}px`,
                    top: `${element.position.y + 40}px`
                  }}
                >
                  {!editingText && (
                    <>
                      <button
                        className="p-1 hover:bg-gray-100 rounded text-xs"
                        onClick={() => setEditingText(element.id)}
                      >
                        Edit Text
                      </button>
                      <div className="h-4 w-px bg-gray-300" />
                    </>
                  )}
                  <select
                    className="text-sm p-1 border rounded"
                    value={element.fontFamily || 'Arial, sans-serif'}
                    onChange={(e) => handleFontChange(element.id, e.target.value)}
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-16 text-sm p-1 border rounded"
                    value={element.fontSize || 24}
                    onChange={(e) => handleFontSizeChange(element.id, e.target.value)}
                    min="8"
                    max="72"
                  />
                  <input
                    type="color"
                    className="w-8 h-8 p-0 cursor-pointer"
                    value={element.color || '#000000'}
                    onChange={(e) => handleColorChange(element.id, e.target.value)}
                    title="Text Color"
                  />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustElementProperty(element.id, 'scale', -0.1)}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustElementProperty(element.id, 'scale', 0.1)}
                  >
                    <Plus size={16} />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustElementProperty(element.id, 'rotation', -45)}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustElementProperty(element.id, 'rotation', 45)}
                  >
                    <RotateCw size={16} />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                    onClick={() => removeElement(element.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
          
          {watermarks.map((watermark) => (
            <React.Fragment key={watermark.id}>
              <div
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
                {watermark.type === 'text' ? (
                  <div
                    style={{
                      fontSize: `${watermark.fontSize || 24}px`,
                      fontFamily: watermark.fontFamily || 'Arial, sans-serif',
                      fontWeight: watermark.fontWeight,
                      color: watermark.color,
                      whiteSpace: 'nowrap',
                      userSelect: 'none'
                    }}
                  >
                    {watermark.text}
                  </div>
                ) : (
                  <img
                    src={watermark.url}
                    alt={watermark.name}
                    className="max-w-[200px] max-h-[200px] object-contain select-none"
                    draggable={false}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </div>
              
              {selectedWatermark === watermark.id && watermark.type === 'text' && (
                <div 
                  className="absolute bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-50"
                  style={{
                    left: `${watermark.position.x}px`,
                    top: `${watermark.position.y + 40}px`
                  }}
                >
                  <select
                    className="text-sm p-1 border rounded"
                    value={watermark.fontFamily || 'Arial, sans-serif'}
                    onChange={(e) => handleFontChange(watermark.id, e.target.value, true)}
                  >
                    {fontOptions.map(font => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-16 text-sm p-1 border rounded"
                    value={watermark.fontSize || 24}
                    onChange={(e) => handleFontSizeChange(watermark.id, e.target.value, true)}
                    min="8"
                    max="72"
                  />
                  <input
                    type="color"
                    className="w-8 h-8 p-0 cursor-pointer"
                    value={watermark.color || '#000000'}
                    onChange={(e) => handleColorChange(watermark.id, e.target.value, true)}
                    title="Text Color"
                  />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'scale', -0.1)}
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'scale', 0.1)}
                  >
                    <Plus size={16} />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'opacity', -0.1)}
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'opacity', 0.1)}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'rotation', -15)}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => adjustWatermarkProperty(watermark.id, 'rotation', 15)}
                  >
                    <RotateCw size={16} />
                  </button>
                  <div className="h-4 w-px bg-gray-300" />
                  <button
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    onClick={() => removeWatermark(watermark.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
