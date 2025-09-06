// 📁 app/components/Canvas.tsx
'use client';

import React, { forwardRef, useEffect, useRef, useCallback } from 'react';

interface CanvasProps {
  currentTool: 'brush' | 'eraser';
  brushColor: string;
  brushSize: number;
  className?: string;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ currentTool, brushColor, brushSize, className }, ref) => {
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    
    const getCanvasContext = useCallback(() => {
      const canvas = ref as React.RefObject<HTMLCanvasElement>;
      if (!canvas.current) return null;
      return canvas.current.getContext('2d');
    }, [ref]);
    
    const getEventPos = useCallback((
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
      canvas: HTMLCanvasElement
    ) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let clientX: number, clientY: number;
      
      if ('touches' in e) {
        clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
        clientY = e.touches[0]?.clientY || e.changedTouches[0]?.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }, []);
    
    const startDrawing = useCallback((
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      isDrawingRef.current = true;
      const pos = getEventPos(e, canvas);
      lastPointRef.current = pos;
      
      // Draw single point for very small movements
      draw(e);
    }, [ref, getEventPos]);
    
    const draw = useCallback((
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawingRef.current) return;
      
      const ctx = getCanvasContext();
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      
      if (!ctx || !canvas) return;
      
      const pos = getEventPos(e, canvas);
      const lastPoint = lastPointRef.current;
      
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      } else {
        ctx.globalCompositeOperation = 'destination-out';
      }
      
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      
      lastPointRef.current = pos;
    }, [currentTool, brushColor, brushSize, getCanvasContext, getEventPos, ref]);
    
    const stopDrawing = useCallback(() => {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      
      const ctx = getCanvasContext();
      if (ctx) {
        ctx.beginPath();
      }
    }, [getCanvasContext]);
    
    // Initialize canvas
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      canvas.width = 400;
      canvas.height = 300;
      
      // Initialize with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Enable smooth lines
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }, [ref]);
    
    // Prevent scrolling on touch devices
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      const preventScroll = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      canvas.addEventListener('touchstart', preventScroll, { passive: false });
      canvas.addEventListener('touchmove', preventScroll, { passive: false });
      canvas.addEventListener('touchend', preventScroll, { passive: false });
      
      return () => {
        canvas.removeEventListener('touchstart', preventScroll);
        canvas.removeEventListener('touchmove', preventScroll);
        canvas.removeEventListener('touchend', preventScroll);
      };
    }, [ref]);
    
    return (
      <canvas
        ref={ref}
        className={`cursor-crosshair touch-none ${className}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }
);

Canvas.displayName = 'Canvas';

// 📁 app/components/Toolbar.tsx
'use client';

import React from 'react';

interface ToolbarProps {
  currentTool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  brushColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onSizeChange: (size: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  brushColor,
  onColorChange,
  brushSize,
  onSizeChange
}) => {
  const popularColors = [
    '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#1BB3FF',
    '#8A2BE2', '#FF1493', '#00CED1', '#32CD32', '#FF4500'
  ];
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {/* Tools */}
        <div className="flex gap-2">
          <button
            onClick={() => onToolChange('brush')}
            className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
          >
            🖌️ Pincel
          </button>
          <button
            onClick={() => onToolChange('eraser')}
            className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
          >
            🧽 Borracha
          </button>
        </div>
        
        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Cor:</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-12 h-12 rounded-full border-2 border-gray-300 cursor-pointer"
          />
        </div>
        
        {/* Popular Colors */}
        <div className="flex gap-1">
          {popularColors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                brushColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tamanho:</label>
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 min-w-[3rem]">
            {brushSize}px
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .tool-btn {
          @apply bg-white border-2 border-gray-300 px-4 py-2 rounded-full font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200;
        }
        
        .tool-btn.active {
          @apply border-indigo-500 bg-indigo-500 text-white;
        }
      `}</style>
    </div>
  );
};

// 📁 app/components/ThemeSelector.tsx
'use client';

import React from 'react';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange
}) => {
  const themes = [
    { id: 'casa', name: '🏠 Casa', description: 'Casa simples com jardim' },
    { id: 'parque', name: '🌳 Parque', description: 'Parque com árvores e bancos' },
    { id: 'animais', name: '🐱 Animais', description: 'Bichinhos fofos' },
    { id: 'escola', name: '🏫 Escola', description: 'Ambiente escolar' },
    { id: 'livre', name: '✨ Livre', description: 'Grade para desenho livre' }
  ];
  
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-indigo-600">Tema:</label>
      <select
        value={selectedTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="bg-white border-2 border-indigo-200 rounded-full px-4 py-2 font-medium text-indigo-700 focus:outline-none focus:border-indigo-500 transition-colors"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};
