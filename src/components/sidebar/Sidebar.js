import React from 'react';
import { Type, Image, Layers, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  designElements, 
  handleDragStart, 
  onWatermarkUpload, 
  uploadedImages, 
  onRemoveImage
}) => {
  const tabs = [
    { id: 'text', label: 'Text' },
    { id: 'shapes', label: 'Shapes' },
    { id: 'watermarks', label: 'Image' }
  ];

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
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium mb-3">Upload Image</h3>
                <div className="space-y-2">
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

              {uploadedImages && uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Uploaded Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((image) => (
                      <div
                        key={image.id}
                        className="group relative bg-accent/50 rounded-lg p-2 cursor-move hover:bg-accent"
                        draggable
                        onDragStart={(e) => handleDragStart(e, {
                          type: 'image',
                          imageId: image.id,
                          url: image.url,
                          name: image.name
                        })}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-20 object-contain rounded"
                        />
                        <button
                          onClick={() => onRemoveImage(image.id)}
                          className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'shapes' && (
            <div className="shapes-grid">
              {designElements.shapes?.map((element) => (
                <div
                  key={element.id}
                  className="shape-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, element)}
                >
                  {element.icon}
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
