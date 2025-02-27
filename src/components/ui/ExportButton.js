import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';

const ExportButton = ({ onExport, onBatchExport, hasBatchExport }) => {
  if (!hasBatchExport) {
    return (
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        <Download size={16} />
        <span>Export</span>
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          <Download size={16} />
          <span>Export</span>
          <ChevronDown size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-md shadow-lg p-1 z-50"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm outline-none cursor-pointer hover:bg-blue-50 rounded-sm"
            onSelect={onExport}
          >
            Export Current
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm outline-none cursor-pointer hover:bg-blue-50 rounded-sm"
            onSelect={onBatchExport}
          >
            Export All
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ExportButton;
