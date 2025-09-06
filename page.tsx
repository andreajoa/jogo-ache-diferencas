//  📁 app/page.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AdvancedCanvas } from './components/AdvancedCanvas';
import { ModernToolbar } from './components/ModernToolbar';
import { ColorPalette } from './components/ColorPalette';
import { BrushSelector } from './components/BrushSelector';
import { TextEditor } from './components/TextEditor';
import { FrameSelector } from './components/FrameSelector';
import { templates } from './lib/templates';
import { downloadImage, floodFill } from './lib/utils';

export default function HomePage() {
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  
  const [selectedTheme, setSelectedTheme] = useState('casa');
  const [currentTool, setCurrentTool] = useState<'brush' | 'bucket' | 'eraser' | 'text'>('brush');
  const [brushColor, setBrushColor] = useState('#FF6B35');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<'round' | 'square' | 'spray' | 'texture'>('round');
  const [differenceMode, setDifferenceMode] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [canvasHistory, setCanvasHistory] = useState<{ canvas1: string[], canvas2: string[] }>({ canvas1: [], canvas2: [] });
  const [historyIndex, setHistoryIndex] = useState({ canvas1: -1, canvas2: -1 });
  
  // Advanced color palette with 60+ colors
  const colorPalette = [
    // Basic colors
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00', '#ADFF2F',
    '#00FF00', '#00FF7F', '#00FFFF', '#0080FF', '#0000FF', '#4000FF',
    '#8000FF', '#FF00FF', '#FF007F', '#FF1493', '#DC143C', '#B22222',
    
    // Pastel colors
    '#FFB6C1', '#FFC0CB', '#FFCCCB', '#FFE4E1', '#FFEFD5', '#F0E68C',
    '#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6', '#FF69B4',
    
    // Earth tones
    '#8B4513', '#A0522D', '#CD853F', '#D2B48C', '#F4A460', '#DEB887',
    '#BC8F8F', '#F5DEB3', '#FFE4B5', '#FFDEAD', '#FFE4C4', '#FFEBCD',
    
    // Nature colors
    '#228B22', '#32CD32', '#90EE90', '#98FB98', '#00FA9A', '#00FF7F',
    '#2E8B57', '#3CB371', '#20B2AA', '#48D1CC', '#40E0D0', '#00CED1',
    
    // Cool colors  
    '#4169E1', '#6495ED', '#87CEEB', '#87CEFA', '#00BFFF', '#1E90FF',
    '#6A5ACD', '#483D8B', '#9370DB', '#8A2BE2', '#9400D3', '#9932CC',
    
    // Grays and blacks
    '#000000', '#2F2F2F', '#696969', '#808080', '#A9A9A9', '#C0C0C0',
    '#D3D3D3', '#DCDCDC', '#F5F5F5', '#FFFFFF', '#FFF8DC', '#FFFAF0'
  ];

  const saveToHistory = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>, canvasType: 'canvas1' | 'canvas2') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    setCanvasHistory(prev => {
      const newHistory = { ...prev };
      const currentHistory = newHistory[canvasType];
      const currentIndex = historyIndex[canvasType];
      
      // Remove any history after current index
      currentHistory.splice(currentIndex + 1);
      currentHistory.push(imageData);
      
      // Keep only last 20 states
      if (currentHistory.length > 20) {
        currentHistory.shift();
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => ({
      ...prev,
      [canvasType]: Math.min(prev[canvasType] + 1, 19)
    }));
  }, [historyIndex]);

  const undo = useCallback((canvasType: 'canvas1' | 'canvas2') => {
    const canvasRef = canvasType === 'canvas1' ? canvas1Ref : canvas2Ref;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const currentIndex = historyIndex[canvasType];
    if (currentIndex > 0) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = canvasHistory[canvasType][currentIndex - 1];
      
      setHistoryIndex(prev => ({
        ...prev,
        [canvasType]: currentIndex - 1
      }));
    }
  }, [historyIndex, canvasHistory]);

  const handleBucketFill = useCallback((x: number, y: number, canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const filled = floodFill(imageData, Math.floor(x), Math.floor(y), brushColor);
    
    if (filled) {
      ctx.putImageData(filled, 0, 0);
      saveToHistory(canvasRef, canvasRef === canvas1Ref ? 'canvas1' : 'canvas2');
    }
  }, [brushColor, saveToHistory]);

  const generateTemplate = useCallback(() => {
    const canvas = canvas1Ref.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw template
    const template = templates[selectedTheme as keyof typeof templates];
    if (template) {
      template(ctx);
    }
    
    // Apply frame if selected
    if (selectedFrame) {
      applyFrame(ctx, selectedFrame);
    }
    
    copyToSecondCanvas();
    saveToHistory(canvas1Ref, 'canvas1');
  }, [selectedTheme, selectedFrame]);

  const applyFrame = useCallback((ctx: CanvasRenderingContext2D, frameType: string) => {
    const { width, height } = ctx.canvas;
    
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    switch (frameType) {
      case 'rainbow':
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.17, '#FF8C00');
        gradient.addColorStop(0.33, '#FFD700');
        gradient.addColorStop(0.5, '#00FF00');
        gradient.addColorStop(0.67, '#00BFFF');
        gradient.addColorStop(0.83, '#8A2BE2');
        gradient.addColorStop(1, '#FF1493');
        ctx.strokeStyle = gradient;
        break;
      case 'gold':
        ctx.strokeStyle = '#FFD700';
        break;
      case 'silver':
        ctx.strokeStyle = '#C0C0C0';
        break;
      case 'wood':
        ctx.strokeStyle = '#8B4513';
        break;
      default:
        ctx.strokeStyle = '#000000';
    }
    
    ctx.strokeRect(4, 4, width - 8, height - 8);
    
    // Add corner decorations
    const cornerSize = 20;
    ctx.fillStyle = ctx.strokeStyle;
    
    // Top-left
    ctx.fillRect(4, 4, cornerSize, 8);
    ctx.fillRect(4, 4, 8, cornerSize);
    
    // Top-right
    ctx.fillRect(width - cornerSize - 4, 4, cornerSize, 8);
    ctx.fillRect(width - 12, 4, 8, cornerSize);
    
    // Bottom-left
    ctx.fillRect(4, height - 12, cornerSize, 8);
    ctx.fillRect(4, height - cornerSize - 4, 8, cornerSize);
    
    // Bottom-right
    ctx.fillRect(width - cornerSize - 4, height - 12, cornerSize, 8);
    ctx.fillRect(width - 12, height - cornerSize - 4, 8, cornerSize);
  }, []);
  
  const copyToSecondCanvas = useCallback(() => {
    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    
    if (!canvas1 || !canvas2) return;
    
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    if (!ctx1 || !ctx2) return;
    
    const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    ctx2.putImageData(imageData, 0, 0);
    saveToHistory(canvas2Ref, 'canvas2');
  }, [saveToHistory]);
  
  const clearCanvases = useCallback(() => {
    [canvas1Ref, canvas2Ref].forEach(ref => {
      const canvas = ref.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    setCanvasHistory({ canvas1: [], canvas2: [] });
    setHistoryIndex({ canvas1: -1, canvas2: -1 });
  }, []);
  
  const exportImages = useCallback(() => {
    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    
    if (!canvas1 || !canvas2) return;
    
    downloadImage(canvas1, 'imagem-original.png');
    setTimeout(() => {
      downloadImage(canvas2, 'imagem-com-diferencas.png');
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4 drop-shadow-2xl animate-pulse">
            🎨 ACHE AS DIFERENÇAS
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-medium">
            Ferramenta profissional cutting-edge para criar atividades incríveis! 🚀
          </p>
        </div>
        
        {/* Modern Controls */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {/* Theme & Frame Selector */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🎭 Temas & Molduras
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/80">Tema:</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="modern-select w-full"
                >
                  <option value="casa">🏠 Casa Encantada</option>
                  <option value="parque">🌳 Parque Mágico</option>
                  <option value="animais">🐱 Reino Animal</option>
                  <option value="escola">🏫 Super Escola</option>
                  <option value="space">🚀 Aventura Espacial</option>
                  <option value="underwater">🐠 Mundo Submarino</option>
                  <option value="livre">✨ Criação Livre</option>
                </select>
              </div>
              
              <FrameSelector 
                selectedFrame={selectedFrame}
                onFrameChange={setSelectedFrame}
              />
            </div>
          </div>
          
          {/* Advanced Tools */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🛠️ Ferramentas Pro
            </h3>
            <ModernToolbar 
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              onUndo={() => undo('canvas1')}
              onShowColorPalette={() => setShowColorPalette(true)}
              onShowTextEditor={() => setShowTextEditor(true)}
            />
          </div>
          
          {/* Brush Settings */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🖌️ Pincéis Avançados
            </h3>
            <BrushSelector 
              brushType={brushType}
              onBrushTypeChange={setBrushType}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              brushColor={brushColor}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              ⚡ Ações Rápidas
            </h3>
            <div className="space-y-3">
              <button onClick={generateTemplate} className="btn-primary w-full">
                🎯 Gerar Template
              </button>
              <button onClick={copyToSecondCanvas} className="btn-secondary w-full">
                📋 Copiar Imagem
              </button>
              <button onClick={clearCanvases} className="btn-danger w-full">
                🧹 Limpar Tudo
              </button>
              <button onClick={exportImages} className="btn-success w-full">
                📥 Exportar HD
              </button>
            </div>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                🖼️ Imagem Original
              </h3>
              <button 
                onClick={() => undo('canvas1')}
                className="btn-ghost text-sm"
              >
                ↶ Desfazer
              </button>
            </div>
            <AdvancedCanvas 
              ref={canvas1Ref}
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
              brushType={brushType}
              onBucketFill={(x, y) => handleBucketFill(x, y, canvas1Ref)}
              onStrokeEnd={() => saveToHistory(canvas1Ref, 'canvas1')}
              className="w-full max-w-lg mx-auto border-4 border-white/20 rounded-2xl shadow-2xl hover:border-pink-400/50 transition-all duration-300"
            />
          </div>
          
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white flex items-center">
                🔍 Imagem com Diferenças
              </h3>
              <button 
                onClick={() => undo('canvas2')}
                className="btn-ghost text-sm"
              >
                ↶ Desfazer
              </button>
            </div>
            <AdvancedCanvas 
              ref={canvas2Ref}
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
              brushType={brushType}
              onBucketFill={(x, y) => handleBucketFill(x, y, canvas2Ref)}
              onStrokeEnd={() => saveToHistory(canvas2Ref, 'canvas2')}
              className="w-full max-w-lg mx-auto border-4 border-white/20 rounded-2xl shadow-2xl hover:border-purple-400/50 transition-all duration-300"
            />
            <div className="text-center mt-4">
              <button 
                onClick={() => setDifferenceMode(!differenceMode)}
                className={`btn-toggle ${differenceMode ? 'active' : ''}`}
              >
                {differenceMode ? '✅ Modo Diferença ON' : '➕ Ativar Diferenças'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Export Section */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            🚀 Sua Criação Está Pronta!
          </h3>
          <p className="text-white/80 mb-6 text-lg">
            Exporte em alta definição ou compartilhe diretamente nas redes sociais
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={exportImages} className="btn-primary-lg">
              📥 Download HD
            </button>
            <button onClick={() => window.print()} className="btn-secondary-lg">
              🖨️ Imprimir
            </button>
            <button 
              onClick={() => navigator.share && navigator.share({
                title: 'Jogo Ache as Diferenças',
                text: 'Criei um jogo incrível!',
                url: window.location.href
              })}
              className="btn-accent-lg"
            >
              📤 Compartilhar
            </button>
          </div>
        </div>
      </div>
      
      {/* Color Palette Modal */}
      {showColorPalette && (
        <ColorPalette 
          colors={colorPalette}
          onColorSelect={setBrushColor}
          onClose={() => setShowColorPalette(false)}
        />
      )}
      
      {/* Text Editor Modal */}
      {showTextEditor && (
        <TextEditor 
          onClose={() => setShowTextEditor(false)}
          onAddText={(text, style) => {
            // Implementation for adding text to canvas
            console.log('Add text:', text, style);
          }}
        />
      )}
      
      {/* Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }
        
        .modern-select {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          padding: 12px 16px;
          backdrop-filter: blur(10px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary-lg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
        }
        
        .btn-secondary-lg {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 12px 35px rgba(240, 147, 251, 0.3);
        }
        
        .btn-success {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(250, 112, 154, 0.3);
        }
        
        .btn-accent-lg {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #333;
          border: none;
          padding: 16px 32px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 12px 35px rgba(168, 237, 234, 0.3);
        }
        
        .btn-ghost {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .btn-toggle {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .btn-toggle.active {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-color: transparent;
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
        }
        
        button:hover {
          transform: translateY(-2px);
        }
        
        /* Touch optimizations */
        @media (max-width: 768px) {
          .glass-card {
            backdrop-filter: blur(15px);
          }
          
          button {
            min-height: 48px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
