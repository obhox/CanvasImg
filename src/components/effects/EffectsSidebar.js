import React from 'react';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

const EffectsSidebar = ({
  isOpen,
  onClose,
  selectedElement,
  updateElementProperties
}) => {
  if (!isOpen || !selectedElement) return null;

  // Font options
  const fontFamilies = [
    'Arial, sans-serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'Georgia, serif',
    'Verdana, sans-serif'
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' }
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Effects</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Font Family</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.fontFamily}
                  onChange={(e) => updateElementProperties(selectedElement.id, { fontFamily: e.target.value })}
                >
                  {fontFamilies.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Font Size</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateElementProperties(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                >
                  {fontSizes.map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Font Weight</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.fontWeight}
                  onChange={(e) => updateElementProperties(selectedElement.id, { fontWeight: e.target.value })}
                >
                  {fontWeights.map(weight => (
                    <option key={weight.value} value={weight.value}>{weight.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Text Color</label>
                <input
                  type="color"
                  className="w-full h-10 p-1 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => updateElementProperties(selectedElement.id, { color: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Text Alignment</label>
                <select
                  className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.textAlign || 'left'}
                  onChange={(e) => updateElementProperties(selectedElement.id, { textAlign: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          )}

          {selectedElement.type === 'shape' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Shape Color</label>
                <input
                  type="color"
                  className="w-full h-10 p-1 border rounded-md bg-white/50 backdrop-blur-sm"
                  value={selectedElement.color}
                  onChange={(e) => updateElementProperties(selectedElement.id, { color: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Width</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                      value={selectedElement.size?.width || 100}
                      onChange={(e) => updateElementProperties(selectedElement.id, {
                        size: { ...selectedElement.size, width: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Height</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md bg-white/50 backdrop-blur-sm"
                      value={selectedElement.size?.height || 100}
                      onChange={(e) => updateElementProperties(selectedElement.id, {
                        size: { ...selectedElement.size, height: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedElement.type === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Opacity</label>
                <input
                  type="range"
                  className="w-full"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.opacity || 1}
                  onChange={(e) => updateElementProperties(selectedElement.id, {
                    opacity: parseFloat(e.target.value)
                  })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Scale</label>
                <input
                  type="range"
                  className="w-full"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={selectedElement.scale || 1}
                  onChange={(e) => updateElementProperties(selectedElement.id, {
                    scale: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EffectsSidebar; 