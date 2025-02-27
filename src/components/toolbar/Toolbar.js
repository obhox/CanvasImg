import React from 'react';
import {
  Undo, Redo, Copy, Trash2, Lock,
  Grid3X3, Eye, Save, CheckSquare, Download, Upload
} from 'lucide-react';
import { Button } from '../ui/button';

const Toolbar = ({
  showGrid,
  setShowGrid,
  onSave,
  onExport,
  onZoom,
  onUploadImage,
  hasMainImage
}) => {
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
        <Button variant="ghost" size="icon">
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
        {!hasMainImage && (
          <label className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer flex items-center">
            <Upload size={16} className="mr-2" />
            Upload Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onUploadImage}
            />
          </label>
        )}
      </div>

      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <Eye size={18} />
        </Button>
        <Button variant="default" onClick={onSave}>
          <Save size={16} className="mr-1" /> Save Template
        </Button>
        <Button variant="secondary">
          <CheckSquare size={16} className="mr-1" /> Apply to All
        </Button>
        <Button variant="primary" onClick={onExport}>
          <Download size={16} className="mr-1" /> Export Batch
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
