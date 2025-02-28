import React, { useState, useEffect } from 'react';

const ExportDialog = ({ isOpen, onClose, onExport, originalWidth = 800, originalHeight = 600 }) => {
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const aspectRatio = originalWidth / originalHeight;

  useEffect(() => {
    // Reset state when dialog opens
    if (isOpen) {
      setWidth(originalWidth);
      setHeight(originalHeight);
      setError(null);
      setPreviewUrl(null);
    }
  }, [isOpen, originalWidth, originalHeight]);

  useEffect(() => {
    // Cleanup preview URL when dialog closes or when generating new preview
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleWidthChange = (e) => {
    const newWidth = Math.max(1, parseInt(e.target.value) || originalWidth);
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
    // Clear preview when dimensions change
    if (previewUrl) {
      setPreviewUrl(null);
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = Math.max(1, parseInt(e.target.value) || originalHeight);
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
    // Clear preview when dimensions change
    if (previewUrl) {
      setPreviewUrl(null);
    }
  };

  const handlePreview = async () => {
    try {
      setError(null);
      const dataUrl = await onExport(width, height);
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Failed to generate preview. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const dataUrl = await onExport(width, height);
      if (!dataUrl) {
        throw new Error('Failed to generate image');
      }

      // Create and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `canvas-design-${width}x${height}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } catch (error) {
      console.error('Error during export:', error);
      setError('Failed to export image. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Export Image</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              className="w-full px-3 py-2 border rounded-md"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              className="w-full px-3 py-2 border rounded-md"
              min="1"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={maintainAspectRatio}
              onChange={(e) => {
                setMaintainAspectRatio(e.target.checked);
                if (e.target.checked) {
                  // Reset to maintain aspect ratio
                  const newHeight = Math.round(width / aspectRatio);
                  setHeight(newHeight);
                }
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Maintain aspect ratio</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2"
          >
            Preview
          </button>
        </div>

        {previewUrl && (
          <div className="mb-4 border rounded-md p-2">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[300px] object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog; 