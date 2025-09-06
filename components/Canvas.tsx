// 📁 app/components/AdvancedCanvas.tsx
'use client';

import React, { forwardRef, useEffect, useRef, useCallback, useState } from 'react';

interface AdvancedCanvasProps {
  currentTool: 'brush' | 'bucket' | 'eraser' | 'text';
  brushColor: string;
  brushSize: number;
  brushType: 'round' | 'square' | 'spray' | 'texture';
  onBucketFill: (x: number, y: number) => void;
  onStrokeEnd: () => void;
  className?: string;
}

export const AdvancedCanvas = forwardRef<HTMLCanvasElement, AdvancedCanvasProps>(
  ({ currentTool, brushColor, brushSize, brushType, onBucketFill, onStrokeEnd, className }, ref) => {
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [pressure, setPressure] = useState(1);
    
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
      
      let clientX: number, clientY: number, pressure = 1;
      
      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
        // Use touch force if available
        pressure = (touch as any).force || 1;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
        // Use mouse pressure if available
        pressure = (e as any).pressure || 1;
      }
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        pressure
      };
    }, []);
    
    const applyBrushTexture = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pressure: number) => {
      const adjustedSize = size * pressure;
      
      switch (brushType) {
        case 'round':
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          break;
        case 'square':
          ctx.lineCap = 'square';
          ctx.lineJoin = 'miter';
          break;
        case 'spray':
          // Spray effect - multiple small dots
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * adjustedSize;
            const dotX = x + Math.cos(angle) * distance;
            const dotY = y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          return;
        case 'texture':
          // Textured brush with varying opacity
          const oldAlpha = ctx.globalAlpha;
          for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = Math.random() * 0.3 + 0.1;
            const offsetX = (Math.random() - 0.5) * adjustedSize * 0.3;
            const offsetY = (Math.random() - 0.5) * adjustedSize * 0.3;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, adjustedSize * (Math.random() * 0.5 + 0.5), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = oldAlpha;
          return;
      }
    }, [brushType]);
    
    const startDrawing = useCallback((
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      const pos = getEventPos(e, canvas);
      setPressure(pos.pressure);
      
      if (currentTool === 'bucket') {
        onBucketFill(pos.x, pos.y);
        return;
      }
      
      isDrawingRef.current = true;
      lastPointRef.current = pos;
      
      // Add vibration feedback on mobile
      if ('vibrate' in navigator && 'touches' in e) {
        navigator.vibrate(10);
      }
      
      // Draw initial point for small touches
      draw(e);
    }, [ref, getEventPos, currentTool, onBucketFill]);
    
    const draw = useCallback((
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawingRef.current && currentTool !== 'bucket') return;
      
      const ctx = getCanvasContext();
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      
      if (!ctx || !canvas) return;
      
      const pos = getEventPos(e, canvas);
      const lastPoint = lastPointRef.current;
      
      setPressure(pos.pressure);
      
      const adjustedSize = brushSize * pos.pressure;
      
      ctx.lineWidth = adjustedSize;
      
      if (currentTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
        
        if (brushType === 'spray' || brushType === 'texture') {
          applyBrushTexture(ctx, pos.x, pos.y, adjustedSize, pos.pressure);
        } else {
          applyBrushTexture(ctx, 0, 0, 0, 0); // Apply line caps
          if (lastPoint) {
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
          }
        }
      } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (lastPoint) {
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
      }
      
      lastPointRef.current = pos;
    }, [currentTool, brushColor, brushSize, brushType, getCanvasContext, getEventPos, ref, applyBrushTexture]);
    
    const stopDrawing = useCallback(() => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        lastPointRef.current = null;
        onStrokeEnd();
        
        const ctx = getCanvasContext();
        if (ctx) {
          ctx.beginPath();
        }
      }
    }, [getCanvasContext, onStrokeEnd]);
    
    // Initialize canvas
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set high DPI
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Initialize with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Enable smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }, [ref]);
    
    // Prevent scrolling and context menu on mobile
    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
      if (!canvas) return;
      
      const preventDefaults = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      canvas.addEventListener('touchstart', preventDefaults, { passive: false });
      canvas.addEventListener('touchmove', preventDefaults, { passive: false });
      canvas.addEventListener('touchend', preventDefaults, { passive: false });
      canvas.addEventListener('contextmenu', preventDefaults);
      
      return () => {
        canvas.removeEventListener('touchstart', preventDefaults);
        canvas.removeEventListener('touchmove', preventDefaults);
        canvas.removeEventListener('touchend', preventDefaults);
        canvas.removeEventListener('contextmenu', preventDefaults);
      };
    }, [ref]);
    
    // Show pressure indicator
    const getCursorStyle = () => {
      if (currentTool === 'bucket') return 'url("data:image/svg+xml,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath d=\'M12 2L8 8h8l-4-6z\' fill=\'%23000\'/%3e%3c/svg%3e") 12 12, auto';
      if (currentTool === 'eraser') return 'url("data:image/svg+xml,%3csvg width=\'24\' height=\'24\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect x=\'4\' y=\'4\' width=\'16\' height=\'16\' fill=\'%23ff6b6b\'/%3e%3c/svg%3e") 12 12, auto';
      return 'crosshair';
    };
    
    return (
      <div className="relative">
        <canvas
          ref={ref}
          className={`touch-none select-none ${className}`}
          style={{ cursor: getCursorStyle() }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          width={400}
          height={300}
        />
        
        {/* Pressure indicator for mobile */}
        {pressure !== 1 && (
          <div className="absolute top-2 right-2 bg-black/20 text-white text-xs px-2 py-1 rounded">
            Pressão: {Math.round(pressure * 100)}%
          </div>
        )}
      </div>
    );
  }
);

AdvancedCanvas.displayName = 'AdvancedCanvas';

// 📁 app/components/ModernToolbar.tsx
'use client';

import React from 'react';

interface ModernToolbarProps {
  currentTool: 'brush' | 'bucket' | 'eraser' | 'text';
  onToolChange: (tool: 'brush' | 'bucket' | 'eraser' | 'text') => void;
  onUndo: () => void;
  onShowColorPalette: () => void;
  onShowTextEditor: () => void;
}

export const ModernToolbar: React.FC<ModernToolbarProps> = ({
  currentTool,
  onToolChange,
  onUndo,
  onShowColorPalette,
  onShowTextEditor
}) => {
  const tools = [
    { id: 'brush', icon: '🖌️', name: 'Pincel Inteligente', description: 'Desenhe com pressão' },
    { id: 'bucket', icon: '🪣', name: 'Balde Mágico', description: 'Pinte áreas inteiras' },
    { id: 'eraser', icon: '🧽', name: 'Borracha Pro', description: 'Apague com precisão' },
    { id: 'text', icon: '📝', name: 'Texto Criativo', description: 'Adicione textos lindos' }
  ];
  
  return (
    <div className="space-y-4">
      {/* Main tools */}
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === 'text') {
                onShowTextEditor();
              } else {
                onToolChange(tool.id as any);
              }
            }}
            className={`tool-card ${currentTool === tool.id ? 'active' : ''}`}
            title={tool.description}
          >
            <div className="text-2xl mb-1">{tool.icon}</div>
            <div className="text-xs font-medium">{tool.name}</div>
          </button>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="space-y-2">
        <button onClick={onShowColorPalette} className="action-btn w-full">
          🎨 Paleta de Cores (60+)
        </button>
        <button onClick={onUndo} className="action-btn w-full">
          ↶ Desfazer Última Ação
        </button>
      </div>
      
      <style jsx>{`
        .tool-card {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 12px;
          color: white;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .tool-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .tool-card.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

// 📁 app/components/BrushSelector.tsx
'use client';

import React from 'react';

interface BrushSelectorProps {
  brushType: 'round' | 'square' | 'spray' | 'texture';
  onBrushTypeChange: (type: 'round' | 'square' | 'spray' | 'texture') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
}

export const BrushSelector: React.FC<BrushSelectorProps> = ({
  brushType,
  onBrushTypeChange,
  brushSize,
  onBrushSizeChange,
  brushColor
}) => {
  const brushTypes = [
    { id: 'round', icon: '●', name: 'Redondo', description: 'Clássico suave' },
    { id: 'square', icon: '■', name: 'Quadrado', description: 'Bordas definidas' },
    { id: 'spray', icon: '✨', name: 'Spray', description: 'Efeito aerosol' },
    { id: 'texture', icon: '🎨', name: 'Textura', description: 'Artístico' }
  ];
  
  const brushSizes = [2, 5, 10, 15, 20, 30, 50];
  
  return (
    <div className="space-y-4">
      {/* Brush types */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">
          Tipo de Pincel:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {brushTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onBrushTypeChange(type.id as any)}
              className={`brush-type-btn ${brushType === type.id ? 'active' : ''}`}
              title={type.description}
            >
              <span className="text-lg">{type.icon}</span>
              <span className="text-xs">{type.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Brush size */}
      <div>
        <label className="text-sm font-medium text-white/80 mb-2 block">
          Tamanho: {brushSize}px
        </label>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Quick size buttons */}
        <div className="flex flex-wrap gap-1">
          {brushSizes.map((size) => (
            <button
              key={size}
              onClick={() => onBrushSizeChange(size)}
              className={`size-btn ${brushSize === size ? 'active' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      
      {/* Preview */}
      <div className="bg-white/10 rounded-lg p-3 text-center">
        <div className="text-white/80 text-xs mb-2">Previsão:</div>
        <div 
          className="mx-auto rounded-full transition-all duration-200"
          style={{
            width: `${Math.min(brushSize, 50)}px`,
            height: `${Math.min(brushSize, 50)}px`,
            backgroundColor: brushColor,
            borderRadius: brushType === 'square' ? '2px' : '50%',
            opacity: brushType === 'spray' ? 0.7 : 1,
            filter: brushType === 'texture' ? 'blur(1px)' : 'none'
          }}
        />
      </div>
      
      <style jsx>{`
        .brush-type-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 8px;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          min-height: 60px;
        }
        
        .brush-type-btn:hover {
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-1px);
        }
        
        .brush-type-btn.active {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-color: transparent;
        }
        
        .size-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 4px 8px;
          color: white;
          font-size: 0.75rem;
          transition: all 0.2s ease;
        }
        
        .size-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .size-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};
