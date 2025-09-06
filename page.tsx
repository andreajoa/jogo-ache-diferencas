import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, PaintBucket, Brush, Type, Eraser, Undo, Download, Frame, Sparkles, Layers, Move, RotateCcw, ZoomIn, ZoomOut, Save, Share2, Wand2, Shapes } from 'lucide-react';

const PaintApp = () => {
  const canvasRef = useRef(null);
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(10);
  const [brushType, setBrushType] = useState('round');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [zoom, setZoom] = useState(1);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [textSize, setTextSize] = useState(24);

  // 60+ cores profissionais organizadas
  const colorPalette = {
    basics: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
    warm: ['#FF6B6B', '#FF8E53', '#FF6B35', '#F7931E', '#FFD23F', '#FFF75E', '#D4AF37', '#CD853F'],
    cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#6C5CE7', '#A29BFE', '#00B894', '#00CEC9'],
    pastels: ['#FFE5E5', '#E5F3FF', '#E5FFE5', '#FFFFE5', '#F0E5FF', '#E5FFFF', '#FFE5F0', '#F5F5E5'],
    neon: ['#FF073A', '#00FFF0', '#FFFF00', '#FF0099', '#00FF41', '#FF6600', '#9900FF', '#00FFFF'],
    earth: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#DAA520', '#B8860B', '#A0522D'],
    professional: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#E74C3C', '#E67E22'],
    artistic: ['#9B59B6', '#8E44AD', '#3498DB', '#2980B9', '#1ABC9C', '#16A085', '#F39C12', '#D35400']
  };

  const brushTypes = [
    { id: 'round', name: 'Redondo', icon: '●', description: 'Traço suave clássico' },
    { id: 'square', name: 'Quadrado', icon: '■', description: 'Bordas definidas' },
    { id: 'spray', name: 'Spray', icon: '✨', description: 'Efeito aerosol' },
    { id: 'texture', name: 'Textura', icon: '🎨', description: 'Textura artística' },
    { id: 'calligraphy', name: 'Caligrafia', icon: '✍️', description: 'Traço caligráfico' },
    { id: 'watercolor', name: 'Aquarela', icon: '🌈', description: 'Efeito aquarela' }
  ];

  const frames = [
    { id: 'none', name: 'Sem moldura', preview: '' },
    { id: 'classic', name: 'Clássica', preview: '🖼️' },
    { id: 'modern', name: 'Moderna', preview: '▢' },
    { id: 'ornate', name: 'Ornamentada', preview: '🌟' },
    { id: 'rustic', name: 'Rústica', preview: '🌿' },
    { id: 'neon', name: 'Neon', preview: '⚡' },
    { id: 'minimal', name: 'Minimal', preview: '◻️' }
  ];

  const textFonts = [
    { name: 'Arial', style: 'Arial' },
    { name: 'Comic Sans', style: 'Comic Sans MS' },
    { name: 'Impact', style: 'Impact' },
    { name: 'Times', style: 'Times New Roman' },
    { name: 'Courier', style: 'Courier New' },
    { name: 'Georgia', style: 'Georgia' }
  ];

  const categoryNames = {
    basics: 'Básicas',
    warm: 'Quentes', 
    cool: 'Frias',
    pastels: 'Pastéis',
    neon: 'Neon',
    earth: 'Terra',
    professional: 'Profissionais',
    artistic: 'Artísticas'
  };

  // Salvar estado no histórico
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyStep + 1);
    newHistory.push(dataURL);
    setCanvasHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [canvasHistory, historyStep]);

  // Função de desfazer
  const undo = useCallback(() => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  }, [historyStep, canvasHistory]);

  // Obter posição do evento (mouse/touch)
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
      x: (clientX - rect.left) * scaleX / zoom,
      y: (clientY - rect.top) * scaleY / zoom,
      pressure: Math.min(Math.max(pressure, 0.1), 1)
    };
  }, [zoom]);

  // Algoritmo flood fill para balde de tinta
  const floodFill = useCallback((startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Converter cor hex para RGB
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const pixelStack = [[startX, startY]];
    const visited = new Set();

    while (pixelStack.length) {
      const [x, y] = pixelStack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
      visited.add(key);

      const pos = (y * canvas.width + x) * 4;
      
      if (data[pos] === startR && data[pos + 1] === startG && 
          data[pos + 2] === startB && data[pos + 3] === startA) {
        
        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;

        pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  }, [saveToHistory]);

  // Aplicar efeitos de pincel
  const applyBrushEffect = useCallback((ctx, x, y, size, pressure) => {
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
        ctx.save();
        const particles = Math.floor(adjustedSize / 2);
        for (let i = 0; i < particles; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * adjustedSize;
          const dotX = x + Math.cos(angle) * distance;
          const dotY = y + Math.sin(angle) * distance;
          
          ctx.globalAlpha = Math.random() * 0.8 + 0.2;
          ctx.beginPath();
          ctx.arc(dotX, dotY, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
        
      case 'texture':
        ctx.save();
        for (let i = 0; i < 8; i++) {
          const offsetX = (Math.random() - 0.5) * adjustedSize * 0.5;
          const offsetY = (Math.random() - 0.5) * adjustedSize * 0.5;
          ctx.globalAlpha = Math.random() * 0.4 + 0.1;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, adjustedSize * (Math.random() * 0.3 + 0.2), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
        
      case 'watercolor':
        ctx.save();
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
          const radius = adjustedSize * (0.8 + Math.random() * 0.4);
          const offsetX = (Math.random() - 0.5) * adjustedSize * 0.3;
          const offsetY = (Math.random() - 0.5) * adjustedSize * 0.3;
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return;
        
      case 'calligraphy':
        ctx.lineCap = 'round';
        ctx.lineWidth = adjustedSize * (pressure > 0.5 ? 1.5 : 0.5);
        break;
    }
  }, [brushType]);

  // Iniciar desenho
  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getEventPos(e, canvas);
    
    if (currentTool === 'bucket') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), brushColor);
      return;
    }

    setIsDrawing(true);
    setLastPoint(pos);

    // Vibração no mobile
    if ('vibrate' in navigator && e.touches) {
      navigator.vibrate(10);
    }

    if (currentTool === 'brush') {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
      ctx.strokeStyle = brushColor;
      applyBrushEffect(ctx, pos.x, pos.y, brushSize, pos.pressure);
    }
  }, [currentTool, brushColor, brushSize, getEventPos, floodFill, applyBrushEffect]);

  // Desenhar
  const draw = useCallback((e) => {
    if (!isDrawing || currentTool === 'bucket') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getEventPos(e, canvas);
    
    if (currentTool === 'brush') {
      ctx.lineWidth = brushSize * pos.pressure;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.fillStyle = brushColor;
      
      if (brushType === 'spray' || brushType === 'texture' || brushType === 'watercolor') {
        applyBrushEffect(ctx, pos.x, pos.y, brushSize, pos.pressure);
      } else {
        applyBrushEffect(ctx, 0, 0, 0, 0);
        if (lastPoint) {
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }
      }
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * pos.pressure;
      ctx.lineCap = 'round';
      
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
    
    setLastPoint(pos);
  }, [isDrawing, currentTool, brushColor, brushSize, getEventPos, lastPoint, applyBrushEffect, brushType]);

  // Parar desenho
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      saveToHistory();
    }
  }, [isDrawing, saveToHistory]);

  // Adicionar texto
  const addText = useCallback(() => {
    if (!textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = brushColor;
    ctx.font = `${textSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(textInput, canvas.width / 2, canvas.height / 2);
    
    setTextInput('');
    setShowTextEditor(false);
    saveToHistory();
  }, [textInput, brushColor, textSize, selectedFont, saveToHistory]);

  // Limpar canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, [saveToHistory]);

  // Baixar imagem
  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `ache-diferencas-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // Compartilhar
  const shareImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob(async (blob) => {
      if (navigator.share && blob) {
        const file = new File([blob], 'minha-arte.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: 'Minha Arte - Ache as Diferenças',
            files: [file]
          });
        } catch (err) {
          console.log('Erro ao compartilhar:', err);
        }
      }
    });
  }, []);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = '100%';
    canvas.style.height = '400px';
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    saveToHistory();
  }, [saveToHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
            🎨 Arte Cutting-Edge
          </h1>
          <p className="text-white/80">Crie atividades "Ache as Diferenças" incríveis!</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Tools */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Ferramentas Mágicas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'brush', icon: Brush, name: 'Pincel IA' },
                  { id: 'bucket', icon: PaintBucket, name: 'Balde Pro' },
                  { id: 'eraser', icon: Eraser, name: 'Apagador' },
                  { id: 'text', icon: Type, name: 'Texto+' }
                ].map(({ id, icon: Icon, name }) => (
                  <button
                    key={id}
                    onClick={() => id === 'text' ? setShowTextEditor(true) : setCurrentTool(id)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                      currentTool === id 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-semibold mb-3">Configurações do Pincel</h3>
              
              {/* Current Color */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: brushColor }}
                  />
                  <span className="text-white/80 text-sm font-medium">{brushColor}</span>
                </div>
              </div>
              
              {/* Brush Types */}
              <div className="mb-4">
                <label className="text-white/80 text-sm mb-2 block">Tipo:</label>
                <div className="grid grid-cols-3 gap-1">
                  {brushTypes.map(({ id, name, icon }) => (
                    <button
                      key={id}
                      onClick={() => setBrushType(id)}
                      className={`p-2 rounded-lg text-xs transition-all ${
                        brushType === id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                      title={name}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brush Size */}
              <div className="mb-4">
                <label className="text-white/80 text-sm mb-2 block">
                  Tamanho: {brushSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1 mt-2">
                  {[2, 5, 10, 20, 50].map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className="px-2 py-1 text-xs bg-white/10 text-white/80 rounded hover:bg-white/20"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-white/60 text-xs mb-2">Prévia:</div>
                <div 
                  className="mx-auto transition-all duration-200"
                  style={{
                    width: `${Math.min(brushSize, 40)}px`,
                    height: `${Math.min(brushSize, 40)}px`,
                    backgroundColor: brushColor,
                    borderRadius: brushType === 'square' ? '2px' : '50%',
                    opacity: brushType === 'spray' ? 0.7 : 1
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="space-y-2">
                <button
                  onClick={() => setShowColorPalette(true)}
                  className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium"
                >
                  <Palette className="w-4 h-4" />
                  60+ Cores Profissionais
                </button>
                
                <button
                  onClick={() => setShowFrameSelector(true)}
                  className="w-full flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium"
                >
                  <Frame className="w-4 h-4" />
                  Molduras Elegantes
                </button>
                
                <button
                  onClick={undo}
                  disabled={historyStep <= 0}
                  className="w-full flex items-center gap-2 p-3 bg-white/20 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                  Desfazer
                </button>
                
                <button
                  onClick={clearCanvas}
                  className="w-full flex items-center gap-2 p-3 bg-red-500/80 text-white rounded-xl font-medium hover:bg-red-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar Tudo
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              {/* Canvas Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                  <button
                    onClick={shareImage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl" 
                   style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 cursor-crosshair touch-none"
                  style={{
                    cursor: currentTool === 'bucket' ? 'crosshair' : 'crosshair'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {/* Frame Overlay */}
                {selectedFrame !== 'none' && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: selectedFrame === 'classic' ? '8px solid #8B4513' :
                              selectedFrame === 'modern' ? '4px solid #2C3E50' :
                              selectedFrame === 'ornate' ? '12px solid #D4AF37' :
                              selectedFrame === 'rustic' ? '10px ridge #8B4513' :
                              selectedFrame === 'neon' ? '3px solid #00FFFF' :
                              selectedFrame === 'minimal' ? '1px solid #BDC3C7' : 'none',
                      borderRadius: selectedFrame === 'classic' ? '4px' :
                                   selectedFrame === 'ornate' || selectedFrame === 'neon' ? '8px' :
                                   selectedFrame === 'rustic' ? '6px' :
                                   selectedFrame === 'minimal' ? '2px' : '0',
                      boxShadow: selectedFrame === 'neon' ? '0 0 20px #00FFFF' : 'none'
                    }}
                  />
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-100 text-sm">
                  💡 <strong>Dica Pro:</strong> Use o {
                    currentTool === 'brush' ? 'pincel para desenhar com pressão variável' : 
                    currentTool === 'bucket' ? 'balde para preencher áreas grandes instantaneamente' : 
                    currentTool === 'eraser' ? 'apagador para corrigir detalhes' : 'ferramenta de texto para adicionar palavras'
                  } • Pressione mais forte no celular para traços mais grossos!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette Modal */}
        {showColorPalette && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-xl">🎨 Paleta Profissional</h3>
                <button
                  onClick={() => setShowColorPalette(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {Object.entries(colorPalette).map(([category, colors]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-white/80 text-sm mb-2 capitalize font-medium">
                    {categoryNames[category]}
                  </h4>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setBrushColor(color);
                          setShowColorPalette(false);
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/60 transition-all hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Custom Color Input */}
              <div className="mt-6">
                <label className="text-white/80 text-sm mb-2 block">Cor Personalizada:</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-white/20"
                  />
                  <input
                    type="text"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="#FF5733"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Editor Modal */}
        {showTextEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-xl">📝 Editor de Texto</h3>
                <button
                  onClick={() => setShowTextEditor(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Texto:</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
                    rows="3"
                    placeholder="Digite seu texto aqui..."
                  />
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Fonte:</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    {textFonts.map((font) => (
                      <option key={font.name} value={font.style} className="bg-gray-800">
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Tamanho: {textSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="100"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-white/60 text-xs mb-2">Prévia:</div>
                  <div 
                    style={{
                      fontFamily: selectedFont,
                      fontSize: Math.min(textSize, 24) + 'px',
                      color: brushColor
                    }}
                  >
                    {textInput || 'Texto de exemplo'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTextEditor(false)}
                    className="flex-1 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addText}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600"
                  >
                    Adicionar Texto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Frame Selector Modal */}
        {showFrameSelector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-xl">🖼️ Molduras Elegantes</h3>
                <button
                  onClick={() => setShowFrameSelector(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      setSelectedFrame(frame.id);
                      setShowFrameSelector(false);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedFrame === frame.id
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">{frame.preview}</div>
                    <div className="text-white text-sm font-medium">{frame.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Touch Instructions */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-black/80 backdrop-blur-lg rounded-xl p-3 text-white text-center text-sm">
          🎯 Dica: Pressione mais forte na tela para traços mais grossos!
        </div>
      </div>
    </div>
  );
};

export default PaintApp;
