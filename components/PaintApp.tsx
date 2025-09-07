import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, PaintBucket, Brush, Eraser, Undo, Download, Home, Sparkles, Zap, RotateCcw } from 'lucide-react';

const ColoringApp = () => {
const canvasRef = useRef(null);
const [tool, setTool] = useState('brush');
const [color, setColor] = useState('#FF6B6B');
const [size, setSize] = useState(15);
const [opacity, setOpacity] = useState(1);
const [showPalette, setShowPalette] = useState(false);
const [isDrawing, setIsDrawing] = useState(false);
const [lastPos, setLastPos] = useState(null);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
const [showScenes, setShowScenes] = useState(false);

const colors = {
neon: ['#ff0080', '#8000ff', '#0080ff', '#00ff80', '#ffff00', '#ff8000'],
ocean: ['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#01FF70', '#2ECC40'],
sunset: ['#FF851B', '#FF4136', '#DC143C', '#B10DC9', '#7B68EE', '#6495ED'],
pastel: ['#FFB3E6', '#FFB3B3', '#FFFFB3', '#B3FFB3', '#B3FFFF', '#B3B3FF']
};

const scenes = {
market: { name: 'Magic Market', icon: '🏪' },
garden: { name: 'Fairy Garden', icon: '🌺' },
castle: { name: 'Dream Castle', icon: '🏰' },
ocean: { name: 'Ocean World', icon: '🌊' }
};

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
data[pos + 3] = Math.floor(255 * opacity);
stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
}
}
ctx.putImageData(imageData, 0, 0);
saveHistory();
}, [opacity, saveHistory]);

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
ctx.globalAlpha = opacity;
} else if (tool === 'eraser') {
ctx.globalCompositeOperation = 'destination-out';
ctx.globalAlpha = 1;
}
if (lastPos) {
ctx.beginPath();
ctx.moveTo(lastPos.x, lastPos.y);
ctx.lineTo(pos.x, pos.y);
ctx.stroke();
}
setLastPos(pos);
}, [isDrawing, tool, color, size, opacity, getPos, lastPos]);

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

const loadScene = useCallback(() => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawMarketScene(ctx);
setShowScenes(false);
saveHistory();
}, [saveHistory]);

const download = useCallback(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const link = document.createElement('a');
link.download = `coloring-art-${Date.now()}.png`;
link.href = canvas.toDataURL();
link.click();
}, []);

const clearCanvas = useCallback(() => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawMarketScene(ctx);
saveHistory();
}, [saveHistory]);

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
<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
<div className="absolute inset-0 opacity-20">
<div className="absolute top-10 left-10 w-32 h-32 bg-pink-500 rounded-full blur-xl animate-pulse"></div>
<div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500 rounded-full blur-2xl animate-bounce"></div>
<div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
</div>
<div className="relative z-10 p-4">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center space-x-3">
<div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
<Sparkles className="w-6 h-6 text-white" />
</div>
<div>
<h1 className="text-2xl font-bold text-white">Bobbie Coloring Studio</h1>
<p className="text-purple-200 text-sm">Create magical masterpieces</p>
</div>
</div>
<div className="flex space-x-2">
<button onClick={() => setShowScenes(true)} className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
<Home className="w-5 h-5" />
</button>
<button onClick={download} className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
<Download className="w-5 h-5" />
</button>
</div>
</div>
<div className="flex flex-col lg:flex-row gap-6">
<div className="w-full lg:w-80 space-y-4">
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
<h3 className="text-white font-semibold mb-4 flex items-center">
<Zap className="w-4 h-4 mr-2" />
Tools
</h3>
<div className="grid grid-cols-3 gap-3">
{[
{ id: 'brush', icon: Brush, name: 'Brush' },
{ id: 'bucket', icon: PaintBucket, name: 'Fill' },
{ id: 'eraser', icon: Eraser, name: 'Eraser' }
].map((t) => (
<button key={t.id} onClick={() => setTool(t.id)} className={`p-3 rounded-xl transition-all duration-300 ${tool === t.id ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg scale-105' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
<t.icon className="w-6 h-6 mx-auto mb-1" />
<div className="text-xs font-medium">{t.name}</div>
</button>
))}
</div>
</div>
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
<h3 className="text-white font-semibold mb-4">Settings</h3>
<div className="mb-4">
<label className="text-white/80 text-sm mb-2 block">Size: {size}px</label>
<input type="range" min="1" max="100" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" />
</div>
<div className="mb-4">
<label className="text-white/80 text-sm mb-2 block">Opacity: {Math.round(opacity * 100)}%</label>
<input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" />
</div>
</div>
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
<h3 className="text-white font-semibold mb-4 flex items-center">
<Palette className="w-4 h-4 mr-2" />
Colors
</h3>
<div className="mb-3">
<div className="w-full h-12 rounded-lg border-2 border-white/30 cursor-pointer" style={{ backgroundColor: color }} onClick={() => setShowPalette(!showPalette)}></div>
<p className="text-white/60 text-xs mt-1 text-center">{color.toUpperCase()}</p>
</div>
{showPalette && (
<div className="space-y-3">
{Object.entries(colors).map(([cat, cols]) => (
<div key={cat}>
<h4 className="text-white/70 text-xs font-medium mb-2">{cat}</h4>
<div className="grid grid-cols-6 gap-1">
{cols.map((c, i) => (
<button key={i} onClick={() => setColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 ${color === c ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'}`} style={{ backgroundColor: c }} />
))}
</div>
</div>
))}
</div>
)}
</div>
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
<div className="space-y-2">
<button onClick={undo} className="w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 flex items-center justify-center">
<Undo className="w-4 h-4 mr-2" />
Undo
</button>
<button onClick={clearCanvas} className="w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 flex items-center justify-center">
<RotateCcw className="w-4 h-4 mr-2" />
Reset
</button>
</div>
</div>
</div>
<div className="flex-1">
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
<canvas ref={canvasRef} className="w-full h-auto max-h-[600px] bg-white rounded-lg shadow-2xl cursor-crosshair touch-none" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
</div>
</div>
</div>
</div>
{showScenes && (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
<h3 className="text-2xl font-bold text-white mb-4">Choose Scene</h3>
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
{Object.entries(scenes).map(([key, sc]) => (
<button key={key} onClick={loadScene} className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-300 hover:scale-105">
<div className="text-3xl mb-2">{sc.icon}</div>
<div className="text-sm font-medium">{sc.name}</div>
</button>
))}
</div>
<button onClick={() => setShowScenes(false)} className="mt-4 w-full p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300">
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

export default ColoringApp;
