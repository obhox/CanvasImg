import React, { useState } from 'react';
import { Type, Image, Layers, Upload, Plus } from 'lucide-react';
import { Button } from '../ui/button';

const Sidebar = ({ activeTab, setActiveTab, designElements, handleDragStart, onWatermarkUpload, onTextWatermarkAdd }) => {
  const [textWatermark, setTextWatermark] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: '24',
    color: '#000000',
    opacity: '0.5',
    fontWeight: 'normal'
  });

  const tabs = [
    { id: 'watermarks', label: 'Watermarks' },
    { id: 'shapes', label: 'Shapes' },
    { id: 'text', label: 'Text' }
  ];

  const handleTextWatermarkSubmit = (e) => {
    e.preventDefault();
    if (textWatermark.trim()) {
      onTextWatermarkAdd({
        text: textWatermark,
        ...textStyle,
        fontSize: parseInt(textStyle.fontSize),
        opacity: parseFloat(textStyle.opacity)
      });
      setTextWatermark('');
      // Reset text style to defaults after adding
      setTextStyle({
        fontSize: '24',
        color: '#000000',
        opacity: '0.5',
        fontWeight: 'normal'
      });
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">Design Elements</h2>
      </div>

      <div className="flex border-b border-border p-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {activeTab === 'watermarks' && (
            <>
              {/* Text Watermark Creator */}
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-medium">Text Watermark</h3>
                <form onSubmit={handleTextWatermarkSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={textWatermark}
                      onChange={(e) => setTextWatermark(e.target.value)}
                      placeholder="Enter watermark text"
                      className="w-full p-2 rounded-md border border-border bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Font Size</label>
                      <select
                        value={textStyle.fontSize}
                        onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                        className="w-full p-1.5 rounded-md border border-border bg-background text-sm"
                      >
                        <option value="16">Small</option>
                        <option value="24">Medium</option>
                        <option value="32">Large</option>
                        <option value="48">Extra Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Weight</label>
                      <select
                        value={textStyle.fontWeight}
                        onChange={(e) => setTextStyle(prev => ({ ...prev, fontWeight: e.target.value }))}
                        className="w-full p-1.5 rounded-md border border-border bg-background text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Color</label>
                    <input
                      type="color"
                      value={textStyle.color}
                      onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-8 p-0 rounded-md border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={textStyle.opacity}
                      onChange={(e) => setTextStyle(prev => ({ ...prev, opacity: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!textWatermark.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text Watermark
                  </Button>
                </form>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium mb-3">Image Watermark</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload Watermark Images</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, SVG (Max: 10MB each)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            if (!file) return;
                            
                            // Validate file type
                            const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
                            if (!validTypes.includes(file.type)) {
                              alert(`File ${file.name} is not a supported image type. Please use PNG, JPG, JPEG, or SVG.`);
                              return;
                            }

                            // Validate file size (10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target && event.target.result) {
                                onWatermarkUpload(event.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                          e.target.value = null; // Reset input
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'shapes' && (
            <div className="space-y-2">
              {designElements.shapes?.map((element) => (
                <div
                  key={element.id}
                  className="p-3 bg-accent/50 rounded-lg cursor-move hover:bg-accent"
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                >
                  <div className="flex items-center space-x-2">
                    {element.icon}
                    <span className="text-sm">{element.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-2">
              {designElements.text?.map((element) => (
                <div
                  key={element.id}
                  className="p-3 bg-accent/50 rounded-lg cursor-move hover:bg-accent"
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                >
                  <div className="flex items-center space-x-2">
                    {element.icon}
                    <span className="text-sm">{element.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
