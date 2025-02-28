import React from 'react';
import { Square, Circle, Triangle, Type, Star, Hexagon, Pentagon, Octagon, Minus } from 'lucide-react';

export const DESIGN_ELEMENTS = {
  watermarks: [],  // Watermarks will be added through file upload
  shapes: [
    { 
      id: 's1',
      type: 'shape',
      shape: 'rectangle',
      icon: <Square className="w-5 h-5" />
    },
    { 
      id: 's2',
      type: 'shape',
      shape: 'circle',
      icon: <Circle className="w-5 h-5" />
    },
    { 
      id: 's3',
      type: 'shape',
      shape: 'triangle',
      icon: <Triangle className="w-5 h-5" />
    },
    {
      id: 's4',
      type: 'shape',
      shape: 'star',
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 's5',
      type: 'shape',
      shape: 'hexagon',
      icon: <Hexagon className="w-5 h-5" />
    },
    {
      id: 's6',
      type: 'shape',
      shape: 'pentagon',
      icon: <Pentagon className="w-5 h-5" />
    },
    {
      id: 's7',
      type: 'shape',
      shape: 'octagon',
      icon: <Octagon className="w-5 h-5" />
    },
    {
      id: 's8',
      type: 'shape',
      shape: 'diamond',
      icon: <div className="w-5 h-5 rotate-45 bg-current" />
    },
    {
      id: 's9',
      type: 'shape',
      shape: 'line',
      icon: <Minus className="w-5 h-5" />
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
