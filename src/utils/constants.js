import React from 'react';
import { Square, Circle, Triangle, Type } from 'lucide-react';

export const DESIGN_ELEMENTS = {
  watermarks: [],  // Watermarks will be added through file upload
  shapes: [
    { 
      id: 's1', 
      name: 'Rectangle', 
      type: 'shape',
      shape: 'rectangle',
      icon: <Square className="w-5 h-5" />
    },
    { 
      id: 's2', 
      name: 'Circle', 
      type: 'shape',
      shape: 'circle',
      icon: <Circle className="w-5 h-5" />
    },
    { 
      id: 's3', 
      name: 'Triangle', 
      type: 'shape',
      shape: 'triangle',
      icon: <Triangle className="w-5 h-5" />
    }
  ],
  text: [
    { 
      id: 't1', 
      name: 'Heading', 
      type: 'text',
      fontSize: 24,
      fontWeight: 'bold'
    },
    { 
      id: 't2', 
      name: 'Subtitle', 
      type: 'text',
      fontSize: 18,
      fontWeight: 'semibold'
    },
    { 
      id: 't3', 
      name: 'Body Text', 
      type: 'text',
      fontSize: 16,
      fontWeight: 'normal'
    }
  ]
};
