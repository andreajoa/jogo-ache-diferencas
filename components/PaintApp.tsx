import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, PaintBucket, Brush, Eraser, Download, Share2, ZoomIn, ZoomOut, RotateCcw, Sparkles, Square, Circle, Star, Zap, Triangle } from 'lucide-react';

const ColoringApp = () => {
const canvasRef = useRef(null);
const containerRef = useRef(null);
const [tool, setTool] = useState('brush');
const [color, setColor] = useState('#3B82F6');
const [size, setSize] = useState(10);
const [brushType, setBrushType] = useState('round');
const [isDrawing, setIsDrawing] = useState(false);
const [lastPos, setLastPos] = useState(null);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
const [zoom, setZoom] = useState(100);

const tools = [
{id: 'brush', icon: Brush, name: 'Pincel IA', desc: 'Inteligente'},
{id: 'bucket', icon: PaintBucket, name: 'Balde Pro', desc: 'Preenchimento'},
{id: 'eraser', icon: Eraser, name: 'Apagador', desc: 'Precisão'},
{id: 'text', icon: Sparkles, name: 'Texto+', desc: 'Criativo'}
];

const brushTypes = [
{id: 'round', icon: Circle, shape: '●'},
{id: 'square', icon: Square, shape: '■'}, 
{id: 'star', icon: Star, shape: '★'},
{id: 'spray', icon: Zap, shape: '✦'},
{id: 'lightning', icon: Triangle, shape: '▲'},
{id: 'heart', icon: Sparkles, shape: '♥'}
];

const saveHistory = useCallback(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const data = canvas.toDataURL();
const newHistory = history.slice(0, historyIndex + 1);
newHistory.push(data);
setHistory(newHistory);
setHistoryIndex(newHistory.length - 1);
}, [history, historyIndex]);

const undo = useCallback(() => {
if (historyIndex > 0) {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
const img = new Image();
img.onload = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, 0, 0);
};
img.src = history[historyIndex - 1];
setHistoryIndex(historyIndex - 1);
}
}, [historyIndex, history]);

const getPos = useCallback((e, canvas) => {
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
let x, y;
if (e.touches) {
const touch = e.touches[0] || e.changedTouches[0];
x = (touch.clientX - rect.left) * scaleX;
y = (touch.clientY - rect.top) * scaleY;
} else {
x = (e.clientX - rect.left) * scaleX;
y = (e.clientY - rect.top) * scaleY;
}
return { x, y };
}, []);

const floodFill = useCallback((x, y, fillColor) => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;
const startPos = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
const startR = data[startPos];
const startG = data[startPos + 1];
const startB = data[startPos + 2];
const fillR = parseInt(fillColor.slice(1, 3), 16);
const fillG = parseInt(fillColor.slice(3, 5), 16);
const fillB = parseInt(fillColor.slice(5, 7), 16);
if (startR === fillR && startG === fillG && startB === fillB) return;
if (startR < 50 && startG < 50 && startB < 50) return;
const stack = [[Math.floor(x), Math.floor(y)]];
const visited = new Set();
while (stack.length > 0) {
const [px, py] = stack.pop();
const key = `${px},${py}`;
if (visited.has(key) || px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) continue;
visited.add(key);
const pos = (py * canvas.width + px) * 4;
if (data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB) {
data[pos] = fillR;
data[pos + 1] = fillG;
data[pos + 2] = fillB;
data[pos + 3] = 255;
stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
}
}
ctx.putImageData(imageData, 0, 0);
saveHistory();
}, [saveHistory]);

const startDraw = useCallback((e) => {
e.preventDefault();
const canvas = canvasRef.current;
if (!canvas) return;
const pos = getPos(e, canvas);
if (tool === 'bucket') {
floodFill(pos.x, pos.y, color);
return;
}
setIsDrawing(true);
setLastPos(pos);
}, [tool, color, getPos, floodFill]);

const draw = useCallback((e) => {
if (!isDrawing || tool === 'bucket') return;
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
const pos = getPos(e, canvas);
ctx.lineWidth = size;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
if (tool === 'brush') {
ctx.globalCompositeOperation = 'source-over';
ctx.strokeStyle = color;
ctx.globalAlpha = 1;
if (brushType === 'spray') {
for (let i = 0; i < 15; i++) {
const angle = Math.random() * Math.PI * 2;
const distance = Math.random() * size;
const dotX = pos.x + Math.cos(angle) * distance;
const dotY = pos.y + Math.sin(angle) * distance;
ctx.beginPath();
ctx.arc(dotX, dotY, Math.random() * 2, 0, Math.PI * 2);
ctx.fill();
}
} else {
if (lastPos) {
ctx.beginPath();
ctx.moveTo(lastPos.x, lastPos.y);
ctx.lineTo(pos.x, pos.y);
ctx.stroke();
}
}
} else if (tool === 'eraser') {
ctx.globalCompositeOperation = 'destination-out';
ctx.globalAlpha = 1;
if (lastPos) {
ctx.beginPath();
ctx.moveTo(lastPos.x, lastPos.y);
ctx.lineTo(pos.x, pos.y);
ctx.stroke();
}
}
setLastPos(pos);
}, [isDrawing, tool, color, size, brushType, getPos, lastPos]);

const stopDraw = useCallback(() => {
if (isDrawing) {
setIsDrawing(false);
setLastPos(null);
saveHistory();
}
}, [isDrawing, saveHistory]);

const drawMarketScene = (ctx) => {
ctx.save();
ctx.clearRect(0, 0, 800, 600);
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2;
ctx.fillStyle = 'transparent';
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeRect(50, 100, 700, 400);
ctx.strokeRect(80, 130, 60, 50);
ctx.strokeRect(660, 130, 60, 50);
ctx.strokeRect(375, 450, 50, 50);
ctx.strokeRect(385, 470, 8, 15);
ctx.beginPath();
ctx.moveTo(40, 100);
ctx.lineTo(400, 50);
ctx.lineTo(760, 100);
ctx.stroke();
ctx.strokeRect(320, 70, 160, 30);
ctx.strokeRect(80, 220, 100, 180);
for(let i = 1; i < 6; i++) {
ctx.beginPath();
ctx.moveTo(80, 220 + i * 30);
ctx.lineTo(180, 220 + i * 30);
ctx.stroke();
}
for(let shelf = 0; shelf < 5; shelf++) {
for(let item = 0; item < 6; item++) {
ctx.strokeRect(85 + item * 15, 225 + shelf * 30, 12, 20);
}
}
ctx.strokeRect(280, 300, 120, 100);
ctx.strokeRect(290, 320, 30, 25);
ctx.strokeRect(330, 320, 30, 25);
ctx.strokeRect(370, 320, 20, 25);
for(let i = 0; i < 8; i++) {
ctx.beginPath();
ctx.arc(295 + (i%3) * 10, 330 + Math.floor(i/3) * 8, 4, 0, Math.PI * 2);
ctx.stroke();
}
ctx.strokeRect(520, 220, 80, 200);
for(let i = 1; i < 4; i++) {
ctx.beginPath();
ctx.moveTo(520, 220 + i * 50);
ctx.lineTo(600, 220 + i * 50);
ctx.stroke();
}
for(let shelf = 0; shelf < 3; shelf++) {
for(let bottle = 0; bottle < 5; bottle++) {
ctx.strokeRect(530 + bottle * 12, 230 + shelf * 50, 8, 20);
}
}
for(let x = 60; x < 740; x += 25) {
for(let y = 520; y < 540; y += 15) {
ctx.strokeRect(x, y, 20, 12);
}
}
ctx.strokeRect(200, 430, 35, 25);
ctx.beginPath();
ctx.arc(205, 465, 6, 0, Math.PI * 2);
ctx.arc(230, 465, 6, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.arc(180, 390, 20, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeRect(165, 405, 30, 35);
ctx.beginPath();
ctx.arc(175, 385, 1.5, 0, Math.PI * 2);
ctx.arc(185, 385, 1.5, 0, Math.PI * 2);
ctx.moveTo(175, 395);
ctx.arc(180, 395, 5, 0, Math.PI);
ctx.stroke();
for(let x = 120; x < 680; x += 80) {
ctx.strokeRect(x, 160, 25, 8);
ctx.beginPath();
ctx.arc(x + 12, 170, 6, 0, Math.PI * 2);
ctx.stroke();
}
for(let i = 0; i < 12; i++) {
ctx.strokeRect(100 + i * 50, 200 + (i%3) * 40, 10, 6);
}
ctx.restore();
};

const download = useCallback(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const link = document.createElement('a');
link.download = `arte-${Date.now()}.png`;
link.href = canvas.toDataURL();
link.click();
}, []);

const share = useCallback(async () => {
const canvas = canvasRef.current;
if (!canvas) return;
if (navigator.share) {
canvas.toBlob(async (blob) => {
const file = new File([blob], 'arte.png', { type: 'image/png' });
await navigator.share({ files: [file], title: 'Minha Arte' });
});
} else {
download();
}
}, [download]);

const reset = useCallback(() => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawMarketScene(ctx);
saveHistory();
}, [saveHistory]);

const adjustZoom = useCallback((delta) => {
setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
}, []);

useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
drawMarketScene(ctx);
const initialData = canvas.toDataURL();
setHistory([initialData]);
setHistoryIndex(0);
}, []);

return (
<div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-4">
<div className="max-w-7xl mx-auto">
<div className="text-center mb-6">
<h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center">
<Palette className="w-10 h-10 mr-3 text-orange-300" />
Arte Cutting-Edge
</h1>
<p className="text-blue-100">Crie atividades "Ache as Diferenças" incríveis!</p>
</div>

<div className="grid lg:grid-cols-4 gap-6">
<div className="lg:col-span-1 space-y-4">
<div className="bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
<h3 className="text-white font-bold mb-4 flex items-center text-lg">
<Sparkles className="w-5 h-5 mr-2" />
Ferramentas Mágicas
</h3>
<div className="grid grid-cols-2 gap-3">
{tools.map((t) => (
<button key={t.id} onClick={() => setTool(t.id)} className={`p-4 rounded-2xl transition-all duration-300 ${tool === t.id ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}>
<t.icon className="w-8 h-8 mx-auto mb-2" />
<div className="text-sm font-bold">{t.name}</div>
<div className="text-xs opacity-80">{t.desc}</div>
</button>
))}
</div>
</div>

<div className="bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
<h3 className="text-white font-bold mb-4">Configurações do Pincel</h3>
<div className="mb-4">
<div className="w-12 h-12 rounded-full mx-auto mb-3 border-4 border-white/30" style={{ backgroundColor: color }}></div>
<div className="text-center text-white text-sm font-mono">{color}</div>
</div>
<div className="mb-4">
<label className="text-white/80 text-sm block mb-2">Tipo:</label>
<div className="grid grid-cols-3 gap-2">
{brushTypes.map((bt) => (
<button key={bt.id} onClick={() => setBrushType(bt.id)} className={`p-3 rounded-xl text-xl transition-all ${brushType === bt.id ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
{bt.shape}
</button>
))}
</div>
</div>
<div className="mb-4">
<label className="text-white/80 text-sm block mb-2">Tamanho: {size}px</label>
<input type="range" min="1" max="50" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer" />
</div>
<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-12 rounded-xl cursor-pointer bg-transparent border-2 border-white/30" />
</div>
</div>

<div className="lg:col-span-3 space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-3 bg-white/15 backdrop-blur-lg rounded-2xl p-3 border border-white/20">
<button onClick={() => adjustZoom(-10)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
<ZoomOut className="w-5 h-5" />
</button>
<span className="text-white font-bold text-lg min-w-[60px] text-center">{zoom}%</span>
<button onClick={() => adjustZoom(10)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
<ZoomIn className="w-5 h-5" />
</button>
</div>

<div className="flex space-x-3">
<button onClick={download} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl font-bold transition-all">
<Download className="w-5 h-5" />
<span>Baixar</span>
</button>
<button onClick={share} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-2xl font-bold transition-all">
<Share2 className="w-5 h-5" />
<span>Compartilhar</span>
</button>
</div>
</div>

<div className="bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
<div ref={containerRef} className="overflow-auto bg-white rounded-2xl shadow-2xl" style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}>
<canvas ref={canvasRef} className="cursor-crosshair touch-none block" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
</div>
</div>

<div className="flex justify-center space-x-4">
<button onClick={undo} className="flex items-center space-x-2 bg-white/15 backdrop-blur-lg hover:bg-white/25 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/20">
<RotateCcw className="w-5 h-5" />
<span>Undo</span>
</button>
<button onClick={reset} className="flex items-center space-x-2 bg-white/15 backdrop-blur-lg hover:bg-white/25 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/20">
<Sparkles className="w-5 h-5" />
<span>Reset</span>
</button>
</div>
</div>
</div>
</div>

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
background: linear-gradient(135deg, #06b6d4, #3b82f6);
cursor: pointer;
box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}
input[type="range"]::-moz-range-thumb {
height: 20px;
width: 20px;
border-radius: 50%;
background: linear-gradient(135deg, #06b6d4, #3b82f6);
cursor: pointer;
border: none;
box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
}
input[type="color"] {
-webkit-appearance: none;
appearance: none;
}
input[type="color"]::-webkit-color-swatch-wrapper {
padding: 0;
}
input[type="color"]::-webkit-color-swatch {
border: none;
border-radius: 12px;
}
`}</style>
</div>
);
};

export default ColoringApp;
