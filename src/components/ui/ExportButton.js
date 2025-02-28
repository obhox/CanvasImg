import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';
import ExportDialog from './ExportDialog';

const ExportButton = ({ onExport, onBatchExport, hasBatchExport }) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const handleExportClick = (e) => {
    e.preventDefault();
    setIsExportDialogOpen(true);
  };

  const handleBatchExport = (e) => {
    e.preventDefault();
    if (onBatchExport) {
      onBatchExport();
    }
  };

  // If there's no batch export, just show a simple button
  if (!hasBatchExport) {
    return (
      <>
        <button
          onClick={handleExportClick}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <Download size={16} className="mr-2" />
          Export
        </button>

        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          onExport={onExport}
          originalWidth={800}
          originalHeight={600}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
              <Download size={16} className="mr-2" />
              Export
              <ChevronDown size={16} className="ml-2" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="bg-white rounded-lg shadow-lg py-1 min-w-[160px] z-50"
              sideOffset={5}
            >
              <DropdownMenu.Item 
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center outline-none"
                onSelect={handleExportClick}
              >
                <Download size={16} className="mr-2" />
                Export Current
              </DropdownMenu.Item>

              <DropdownMenu.Item 
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center outline-none"
                onSelect={handleBatchExport}
              >
                <Download size={16} className="mr-2" />
                Export All
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={onExport}
        originalWidth={800}
        originalHeight={600}
      />
    </>
  );
};

export default ExportButton;
