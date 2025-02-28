import React, { useRef } from 'react';
import {
  Undo, Redo, Copy, Trash2, Lock,
  Grid3X3, Eye, Save, Upload, Download
} from 'lucide-react';
import { Button } from '../ui/button';
import ExportButton from '../ui/ExportButton';

const Toolbar = ({
  showGrid,
  setShowGrid,
  onSave,
  onZoom,
  onUploadImage,
  hasMainImage,
  onClearCanvas,
  onExport,
  onBatchExport,
  hasBatchExport,
  canvasCount,
  children
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-card border-b border-border p-2 flex justify-between items-center">
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <Undo size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <Button variant="ghost" size="icon">
          <Copy size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClearCanvas}
          title="Clear Current Canvas"
        >
          <Trash2 size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <Button variant="ghost" size="icon">
          <Lock size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 size={18} className={showGrid ? 'text-primary' : 'text-muted-foreground'} />
        </Button>

        <div className="flex items-center space-x-2">
          <label className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer flex items-center">
            <Upload size={16} className="mr-2" />
            Upload Image{canvasCount > 0 ? 's' : ''}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onUploadImage}
              multiple
            />
          </label>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Eye size={18} />
        </Button>
        <Button variant="default" onClick={onSave}>
          <Save size={16} className="mr-1" /> Save Template
        </Button>
        <ExportButton
          onExport={onExport}
          onBatchExport={onBatchExport}
          hasBatchExport={hasBatchExport}
        />
        {children}
      </div>
    </div>
  );
};

export default Toolbar;
