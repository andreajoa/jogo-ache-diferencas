//  📁 app/page.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ThemeSelector } from './components/ThemeSelector';
import { templates } from './lib/templates';
import { downloadImage } from './lib/utils';

export default function HomePage() {
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  
  const [selectedTheme, setSelectedTheme] = useState('casa');
  const [currentTool, setCurrentTool] = useState<'brush' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState('#FF6B35');
  const [brushSize, setBrushSize] = useState(5);
  const [differenceMode, setDifferenceMode] = useState(false);
  const [differences, setDifferences] = useState<number>(0);
  
  const generateTemplate = useCallback(() => {
    const canvas = canvas1Ref.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw template
    const template = templates[selectedTheme as keyof typeof templates];
    if (template) {
      template(ctx);
    }
    
    copyToSecondCanvas();
  }, [selectedTheme]);
  
  const copyToSecondCanvas = useCallback(() => {
    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    
    if (!canvas1 || !canvas2) return;
    
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    
    if (!ctx1 || !ctx2) return;
    
    const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    ctx2.putImageData(imageData, 0, 0);
  }, []);
  
  const clearCanvases = useCallback(() => {
    [canvas1Ref, canvas2Ref].forEach(ref => {
      const canvas = ref.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    setDifferences(0);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* PWA Meta Tags */}
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🔍 Ache as Diferenças
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Crie atividades personalizadas para desenvolver atenção e foco das crianças!
          </p>
        </div>
        
        {/* Instructions */}
        <div className="bg-emerald-500 text-white rounded-2xl p-6 mb-8 shadow-xl">
          <h3 className="text-xl font-bold mb-3">📋 Como usar:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">1. 🎨 Escolha um tema e gere o template</p>
              <p className="mb-2">2. ✏️ Complete o desenho na primeira imagem</p>
            </div>
            <div>
              <p className="mb-2">3. 📋 Copie para a segunda imagem</p>
              <p className="mb-2">4. ➕ Adicione diferenças e exporte!</p>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <ThemeSelector 
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
            />
            
            <button 
              onClick={generateTemplate}
              className="btn-primary"
            >
              🎯 Gerar Template
            </button>
            
            <button 
              onClick={copyToSecondCanvas}
              className="btn-secondary"
            >
              📋 Copiar
            </button>
            
            <button 
              onClick={clearCanvases}
              className="btn-danger"
            >
              🧹 Limpar
            </button>
            
            <button 
              onClick={exportImages}
              className="btn-success"
            >
              📥 Exportar
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <Toolbar 
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          brushColor={brushColor}
          onColorChange={setBrushColor}
          brushSize={brushSize}
          onSizeChange={setBrushSize}
        />
        
        {/* Canvas Area */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              🖼️ Imagem Original
            </h3>
            <Canvas 
              ref={canvas1Ref}
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
              className="w-full max-w-md mx-auto border-4 border-gray-200 rounded-xl hover:border-indigo-400 transition-colors"
            />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-indigo-600 mb-4 text-center">
              🔍 Imagem com Diferenças
            </h3>
            <Canvas 
              ref={canvas2Ref}
              currentTool={currentTool}
              brushColor={brushColor}
              brushSize={brushSize}
              className="w-full max-w-md mx-auto border-4 border-gray-200 rounded-xl hover:border-indigo-400 transition-colors"
            />
            <div className="text-center mt-4">
              <button 
                onClick={() => setDifferenceMode(!differenceMode)}
                className={`btn-toggle ${differenceMode ? 'active' : ''}`}
              >
                {differenceMode ? '✅ Modo Diferença Ativo' : '➕ Adicionar Diferenças'}
              </button>
              {differences > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Diferenças adicionadas: {differences}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Export Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl">
          <h3 className="text-2xl font-bold text-indigo-600 mb-4">
            🖨️ Pronto para usar!
          </h3>
          <p className="text-gray-700 mb-4">
            Suas imagens estão prontas para serem utilizadas como atividade educativa
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={exportImages} className="btn-primary">
              📥 Baixar Imagens
            </button>
            <button 
              onClick={() => window.print()} 
              className="btn-secondary"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
        
        .btn-primary {
          @apply bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200;
        }
        
        .btn-secondary {
          @apply bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200;
        }
        
        .btn-danger {
          @apply bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200;
        }
        
        .btn-success {
          @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200;
        }
        
        .btn-toggle {
          @apply bg-white border-2 border-indigo-300 text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-50 transition-all duration-200;
        }
        
        .btn-toggle.active {
          @apply bg-indigo-500 border-indigo-500 text-white;
        }
      `}</style>
    </div>
  );
}
