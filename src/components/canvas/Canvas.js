import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Move, Trash2, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

const Canvas = ({
  canvasRef,
  zoom,
  handleDrop,
  handleDragOver,
  mainImage,
  watermarks,
  updateWatermarkPosition,
  updateWatermarkProperties,
  removeWatermark
}) => {
  const [selectedWatermark, setSelectedWatermark] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWatermarkMouseDown = (e, watermark) => {
    e.stopPropagation();
    setSelectedWatermark(watermark.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - watermark.position.x,
      y: e.clientY - watermark.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedWatermark) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - dragStart.x, rect.width));
      const y = Math.max(0, Math.min(e.clientY - dragStart.y, rect.height));
      
      updateWatermarkPosition(selectedWatermark, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  return (
    <div className="flex-1 bg-gray-200 overflow-auto flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          ref={canvasRef}
          className="bg-white shadow-lg relative"
          style={{
            width: '800px',
            height: '600px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {mainImage && (
            <img
              src={mainImage.url}
              alt={mainImage.name}
              className="w-full h-full object-cover"
            />
          )}
          
          {watermarks.map((watermark) => (
            <React.Fragment key={watermark.id}>
              <div
                className={`absolute cursor-move ${selectedWatermark === watermark.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: watermark.position.x,
                  top: watermark.position.y,
                  transform: `scale(${watermark.scale}) rotate(${watermark.rotation}deg)`,
                  opacity: watermark.opacity,
                  transformOrigin: 'top left'
                }}
                onMouseDown={(e) => handleWatermarkMouseDown(e, watermark)}
              >
                {watermark.type === 'text' ? (
                  <div
                    style={{
                      fontSize: `${watermark.fontSize}px`,
                      fontWeight: watermark.fontWeight,
                      color: watermark.color,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {watermark.text}
                  </div>
                ) : (
                  <img
                    src={watermark.url}
                    alt={watermark.name}
                    className="max-w-[200px] max-h-[200px] object-contain"
                    draggable={false}
                  />
                )}
              </div>
              
              {selectedWatermark === watermark.id && (
                <div 
                  className="fixed bg-white shadow-lg rounded-lg p-2 flex items-center space-x-2 z-50"
                  style={{
                    left: `${watermark.position.x}px`,
                    top: `${watermark.position.y + (watermark.type === 'text' ? 40 : 210)}px`
                  }}
                >
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
