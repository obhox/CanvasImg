import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  Type, 
  Circle, 
  Square, 
  Triangle,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Droplets,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const CanvasMenu = ({ 
  selectedElement,
  selectedWatermark,
  watermarks,
  updateElementProperties,
  updateWatermarkProperties,
  setActiveTab,
  removeElement,
  removeWatermark
}) => {
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  // Font options
  const fontFamilies = [
    'Arial, sans-serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Georgia, serif',
    'Verdana, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Playfair Display, serif',
    'Merriweather, serif',
    'Source Sans Pro, sans-serif',
    'Ubuntu, sans-serif',
    'Oswald, sans-serif',
    'Raleway, sans-serif',
    'PT Sans, sans-serif',
    'Nunito, sans-serif',
    'Quicksand, sans-serif',
    'Josefin Sans, sans-serif',
    'Dancing Script, cursive',
    'Pacifico, cursive',
    'Caveat, cursive',
    'Indie Flower, cursive',
    'Shadows Into Light, cursive',
    'Permanent Marker, cursive',
    'Architects Daughter, cursive',
    'Satisfy, cursive',
    'Great Vibes, cursive',
    'Sacramento, cursive',
    'Lobster, cursive',
    'Comfortaa, cursive',
    'Righteous, sans-serif',
    'Abril Fatface, cursive',
    'Bebas Neue, sans-serif'
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  if (!selectedElement && !selectedWatermark) {
    return (
      <div className="h-12 bg-white border-b border-border flex items-center px-4 gap-2">
        <div className="text-sm text-muted-foreground">Click the canvas or an element to edit</div>
      </div>
    );
  }

  const handleTextAlign = (alignment) => {
    updateElementProperties(selectedElement.id, { textAlign: alignment });
  };

  const handleFontStyle = (style) => {
    if (!selectedElement) return;
    
    switch (style) {
      case 'bold':
        updateElementProperties(selectedElement.id, {
          fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
        });
        break;
      case 'italic':
        updateElementProperties(selectedElement.id, {
          fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic'
        });
        break;
      case 'underline':
        updateElementProperties(selectedElement.id, {
          textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline'
        });
        break;
    }
  };

  const handleOpacityChange = (value) => {
    const opacity = parseFloat(value);
    if (selectedElement) {
      updateElementProperties(selectedElement.id, { opacity });
    } else if (selectedWatermark) {
      updateWatermarkProperties(selectedWatermark, { opacity });
    }
  };

  const adjustProperty = (property, delta) => {
    let newValue;
    if (selectedElement) {
      switch (property) {
        case 'scale':
          newValue = Math.max(0.1, Math.min(2, (selectedElement.scale || 1) + delta));
          break;
        case 'rotation':
          newValue = ((selectedElement.rotation || 0) + delta) % 360;
          break;
        case 'fontSize':
          newValue = Math.max(8, Math.min(72, (selectedElement.fontSize || 24) + delta));
          break;
        default:
          return;
      }
      updateElementProperties(selectedElement.id, { [property]: newValue });
    } else if (selectedWatermark) {
      const watermark = watermarks.find(w => w.id === selectedWatermark);
      if (watermark) {
        switch (property) {
          case 'scale':
            newValue = Math.max(0.1, Math.min(2, (watermark.scale || 1) + delta));
            break;
          case 'rotation':
            newValue = ((watermark.rotation || 0) + delta) % 360;
            break;
          default:
            return;
        }
        updateWatermarkProperties(selectedWatermark, { [property]: newValue });
      }
    }
  };

  return (
    <div className="bg-white border-b border-border">
      {/* Common Controls */}
      <div className="h-12 flex items-center px-4 gap-2">
        {/* Color Control - For canvas background or elements */}
        {selectedElement && (
          <div className="flex items-center gap-2 border-r border-border pr-2">
            <input
              type="color"
              value={selectedElement.type === 'canvas' ? selectedElement.color : (selectedElement.color || '#000000')}
              onChange={(e) => {
                if (selectedElement.type === 'canvas') {
                  updateElementProperties(null, { color: e.target.value });
                } else {
                  updateElementProperties(selectedElement.id, { color: e.target.value });
                }
              }}
              className="w-8 h-8 p-1 border rounded cursor-pointer"
            />
            <span className="text-sm">{selectedElement.type === 'canvas' ? 'Background Color' : 'Color'}</span>
          </div>
        )}

        {/* Scale Controls - Only show for non-canvas elements */}
        {selectedElement && selectedElement.type !== 'canvas' && (
          <div className="flex items-center gap-1 border-r border-border pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustProperty('scale', -0.1)}
            >
              <Minus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustProperty('scale', 0.1)}
            >
              <Plus size={16} />
            </Button>
          </div>
        )}

        {/* Rotation Controls */}
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustProperty('rotation', -45)}
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustProperty('rotation', 45)}
          >
            <RotateCw size={16} />
          </Button>
        </div>

        {/* Text-specific Controls */}
        {selectedElement?.type === 'text' && (
          <>
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <select
                className="h-8 px-2 border rounded-md text-sm"
                value={selectedElement.fontFamily}
                onChange={(e) => updateElementProperties(selectedElement.id, { fontFamily: e.target.value })}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
              <select
                className="h-8 w-20 px-2 border rounded-md text-sm"
                value={selectedElement.fontSize}
                onChange={(e) => updateElementProperties(selectedElement.id, { fontSize: parseInt(e.target.value) })}
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextAlign('left')}
                className={selectedElement.textAlign === 'left' ? 'bg-accent' : ''}
              >
                <AlignLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextAlign('center')}
                className={selectedElement.textAlign === 'center' ? 'bg-accent' : ''}
              >
                <AlignCenter size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTextAlign('right')}
                className={selectedElement.textAlign === 'right' ? 'bg-accent' : ''}
              >
                <AlignRight size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFontStyle('bold')}
                className={selectedElement.fontWeight === 'bold' ? 'bg-accent' : ''}
              >
                <Bold size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFontStyle('italic')}
                className={selectedElement.fontStyle === 'italic' ? 'bg-accent' : ''}
              >
                <Italic size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFontStyle('underline')}
                className={selectedElement.textDecoration === 'underline' ? 'bg-accent' : ''}
              >
                <Underline size={16} />
              </Button>
            </div>
          </>
        )}

        {/* Transparency Control */}
        <div className="flex items-center gap-2 border-r border-border pr-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={(selectedElement?.opacity || selectedWatermark?.opacity || 1)}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-32"
          />
          <div className="text-sm">
            {Math.round((selectedElement?.opacity || selectedWatermark?.opacity || 1) * 100)}%
          </div>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedElement ? removeElement(selectedElement.id) : removeWatermark(selectedWatermark)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CanvasMenu; 