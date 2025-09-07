import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, PaintBucket, Brush, Eraser, Undo, Download, Home, Sparkles, Zap } from 'lucide-react';

const AdvancedColoringApp = () => {
  const canvasRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(15);
  const [brushType, setBrushType] = useState('round');
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [currentDrawing, setCurrentDrawing] = useState('butterfly');
  const [showDrawingSelector, setShowDrawingSelector] = useState(false);
  const [pressure, setPressure] = useState(1);

  // Color palette
  const colorPalette = {
    neon: ['#ff0080', '#8000ff', '#0080ff', '#00ff80', '#ffff00', '#ff8000', '#ff0040', '#4000ff'],
    ocean: ['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#01FF70', '#2ECC40', '#3D9970', '#85F985'],
    sunset: ['#FF851B', '#FF4136', '#DC143C', '#B10DC9', '#7B68EE', '#6495ED', '#87CEEB', '#FFE4B5'],
    pastel: ['#FFB3E6', '#FFB3B3', '#FFFFB3', '#B3FFB3', '#B3FFFF', '#B3B3FF', '#E6B3FF', '#FFE6B3'],
    rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF1493']
  };

  const categoryNames = {
    neon: 'Neon Glow',
    ocean: 'Ocean Deep',
    sunset: 'Sunset Magic',
    pastel: 'Soft Touch',
    rainbow: 'Rainbow Pop'
  };

  // Drawings library
  const drawings = {
    butterfly: {
      name: 'Magical Butterfly',
      icon: '🦋',
      category: 'Nature',
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="150" rx="3" ry="70" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M200 110 Q150 60 100 90 Q70 120 100 150 Q130 170 180 150 L200 110" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M200 110 Q250 60 300 90 Q330 120 300 150 Q270 170 220 150 L200 110" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M200 190 Q160 220 120 200 Q90 220 120 250 Q150 270 190 230 L200 190" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M200 190 Q240 220 280 200 Q310 220 280 250 Q250 270 210 230 L200 190" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="185" cy="85" r="4" fill="#000"/>
        <circle cx="215" cy="85" r="4" fill="#000"/>
        <line x1="185" y1="85" x2="180" y2="70" stroke="#000" stroke-width="3"/>
        <line x1="215" y1="85" x2="220" y2="70" stroke="#000" stroke-width="3"/>
        <circle cx="140" cy="120" r="12" fill="none" stroke="#000" stroke-width="2"/>
        <circle cx="260" cy="120" r="12" fill="none" stroke="#000" stroke-width="2"/>
      </svg>`
    },
    dragon: {
      name: 'Mystic Dragon',
      icon: '🐉',
      category: 'Fantasy',
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 180 Q120 140 160 160 Q200 180 240 160 Q280 140 320 180" fill="none" stroke="#000" stroke-width="4"/>
        <ellipse cx="320" cy="180" rx="40" ry="30" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M350 165 Q370 150 380 165 Q370 180 350 165" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="340" cy="170" r="6" fill="none" stroke="#000" stroke-width="2"/>
        <circle cx="340" cy="190" r="6" fill="none" stroke="#000" stroke-width="2"/>
        <path d="M300 160 Q290 140 300 120 Q310 140 300 160" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="335" cy="180" r="3" fill="#000"/>
      </svg>`
    },
    unicorn: {
      name: 'Rainbow Unicorn',
      icon: '🦄',
      category: 'Fantasy',
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="200" cy="180" rx="50" ry="35" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="160" cy="140" r="25" fill="none" stroke="#000" stroke-width="3"/>
        <path d="M160 115 Q150 90 160 80 Q170 90 160 115" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="150" cy="135" r="4" fill="none" stroke="#000" stroke-width="2"/>
        <circle cx="170" cy="135" r="4" fill="none" stroke="#000" stroke-width="2"/>
        <path d="M160 145 L155 152 Q160 155 165 152 Z" fill="none" stroke="#000" stroke-width="2"/>
        <ellipse cx="180" cy="200" rx="8" ry="20" fill="none" stroke="#000" stroke-width="2"/>
        <ellipse cx="220" cy="200" rx="8" ry="20" fill="none" stroke="#000" stroke-width="2"/>
      </svg>`
    },
    flower: {
      name: 'Magic Flower',
      icon: '🌸',
      category: 'Nature',
      svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="150" r="25" fill="none" stroke="#000" stroke-width="3"/>
        <ellipse cx="200" cy="100" rx="20" ry="40" fill="none" stroke="#000" stroke-width="3"/>
        <ellipse cx="200" cy="200" rx="20" ry="40" fill="none" stroke="#000" stroke-width="3"/>
        <ellipse cx="150" cy="150" rx="40" ry="20" fill="none" stroke="#000" stroke-width="3"/>
        <ellipse cx="250" cy="150" rx="40" ry="20" fill="none" stroke="#000" stroke-width="3"/>
        <line x1="200" y1="200" x2="200" y2="270" stroke="#000" stroke-width="4"/>
        <path d="M200 230 Q180 240 185 250 Q195 245 200 230" fill="none" stroke="#000" stroke-width="3"/>
        <circle cx="200" cy="150" r="15" fill="none" stroke="#000" stroke-width="2"/>
      </svg>`
    }
  };

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyStep + 1);
    newHistory.push(dataURL);
    setCanvasHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [canvasHistory, historyStep]);

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  }, [historyStep, canvasHistory]);

  const getEventPos = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY, pressure = 1;
    
    if (e.touches) {
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
      pressure = touch.force || 1;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = e.pressure || 1;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure: Math.max(0.1, pressure)
    };
  }, []);

  const floodFill = useCallback((startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    if ((startR === fillR && startG === fillG && startB === fillB) || 
        (startR < 50 && startG < 50 && startB < 50)) return;

    const pixelStack = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set();

    while (pixelStack.length > 0) {
      const [x, y] = pixelStack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
      visited.add(key);

      const pos = (y * canvas.width + x) * 4;
      
      if (data[pos] === startR && data[pos + 1] === startG && 
          data[pos + 2] === startB &&
          !(data[pos] < 50 && data[pos + 1] < 50 && data[pos + 2] < 50)) {
        
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = Math.floor(255 * brushOpacity);

        pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, [saveToHistory, brushOpacity]);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getEventPos(e, canvas);
    setPressure(pos.pressure);
    
    if (currentTool === 'bucket') {
      floodFill(pos.x, pos.y, brushColor);
      return;
    }

    setIsDrawing(true);
    setLastPoint(pos);

    if ('vibrate' in navigator && e.touches) {
      navigator.vibrate(10);
    }
  }, [currentTool, brushColor, getEventPos, floodFill]);

  const draw = useCallback((e) => {
    if (!isDrawing || currentTool === 'bucket') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const pos = getEventPos(e, canvas);
    setPressure(pos.pressure);
    
    const adjustedSize = brushSize * pos.pressure;
    ctx.lineWidth = adjustedSize;
    
    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.fillStyle = brushColor;
      ctx.globalAlpha = brushOpacity * pos.pressure;
      
      if (brushType === 'spray') {
        for (let i = 0; i < Math.floor(20 * pos.pressure); i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * adjustedSize;
          const dotX = pos.x + Math.cos(angle) * distance;
          const dotY = pos.y + Math.sin(angle) * distance;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, Math.random() * 2 * pos.pressure, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.lineCap = brushType === 'round' ? 'round' : 'square';
        ctx.lineJoin = brushType === 'round' ? 'round' : 'miter';
        
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
      ctx.globalAlpha = 1;
      
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
    
    setLastPoint(pos);
  }, [isDrawing, currentTool, brushColor, brushSize, brushType, brushOpacity, getEventPos, lastPoint]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  const loadDrawing = useCallback((drawingKey) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawing = drawings[drawingKey];
    const svgData = drawing.svg;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(canvas.width / 400, canvas.height / 300) * 0.9;
      const width = 400 * scale;
      const height = 300 * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      ctx.drawImage(img, x, y, width, height);
      URL.revokeObjectURL(url);
      saveToHistory();
    };
    img.src = url;

    setCurrentDrawing(drawingKey);
    setShowDrawingSelector(false);
  }, [saveToHistory]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `coloring-masterpiece-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    setTimeout(() => loadDrawing('butterfly'), 100);
  }, [loadDrawing]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-500 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Coloring Studio Pro</h1>
              <p className="text-purple-200 text-sm">Create magical masterpieces</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDrawingSelector(true)}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={downloadImage}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Tools */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Smart Tools
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'brush', icon: Brush, name: 'Magic Brush', desc: 'Pressure sensitive' },
                  { id: 'bucket', icon: PaintBucket, name: 'Smart Fill', desc: 'AI-powered fill' },
                  { id: 'eraser', icon: Eraser, name: 'Precision Eraser', desc: 'Clean removal' },
                  { id: 'spray', icon: Sparkles, name: 'Spray Paint', desc: 'Artistic texture' }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (tool.id === 'spray') {
                        setCurrentTool('brush');
                        setBrushType('spray');
                      } else {
                        setCurrentTool(tool.id);
                        setBrushType('round');
                      }
                    }}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      (currentTool === tool.id || (tool.id === 'spray' && brushType === 'spray'))
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <tool.icon className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-medium">{tool.name}</div>
                    <div className="text-xs opacity-70">{tool.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Settings */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-4">Brush Settings</h3>
              
              {/* Size */}
              <div className="mb-4">
                <label className="text-white/80 text-sm mb-2 block">Size: {brushSize}px</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="mb-4">
                <label className="text-white/80 text-sm mb-2 block">Opacity: {Math.round(brushOpacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={brushOpacity}
                  onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Color Palette
              </h3>
              
              <div className="mb-3">
                <div 
                  className="w-full h-12 rounded-lg border-2 border-white/30 cursor-pointer"
                  style={{ backgroundColor: brushColor }}
                  onClick={() => setShowColorPalette(!showColorPalette)}
                ></div>
                <p className="text-white/60 text-xs mt-1 text-center">{brushColor.toUpperCase()}</p>
              </div>

              {showColorPalette && (
                <div className="space-y-3">
                  {Object.entries(colorPalette).map(([category, colors]) => (
                    <div key={category}>
                      <h4 className="text-white/70 text-xs font-medium mb-2">{categoryNames[category]}</h4>
                      <div className="grid grid-cols-8 gap-1">
                        {colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setBrushColor(color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${
                              brushColor === color ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <div className="space-y-2">
                <button
                  onClick={undo}
                  className="w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo Last Action
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] bg-white rounded-lg shadow-2xl cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {pressure > 1.1 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Pressure: {Math.round(pressure * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Selector Modal */}
      {showDrawingSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Choose Your Drawing</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(drawings).map(([key, drawing]) => (
                <button
                  key={key}
                  onClick={() => loadDrawing(key)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{drawing.icon}</div>
                  <div className="text-sm font-medium">{drawing.name}</div>
                  <div className="text-xs opacity-70">{drawing.category}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDrawingSelector(false)}
              className="mt-4 w-full p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AdvancedColoringApp;
