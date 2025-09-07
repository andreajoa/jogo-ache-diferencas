import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Palette, PaintBucket, Brush, Eraser, Undo, Download, Home, Sparkles, Zap, RotateCcw } from 'lucide-react';

const ColoringApp = () => {
const canvasRef = useRef(null);
const [tool, setTool] = useState('brush');
const [color, setColor] = useState('#FF6B6B');
const [size, setSize] = useState(8);
const [opacity, setOpacity] = useState(1);
const [showPalette, setShowPalette] = useState(false);
const [isDrawing, setIsDrawing] = useState(false);
const [lastPos, setLastPos] = useState(null);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const colors = {
neon: ['#FF0080', '#8000FF', '#0080FF', '#00FF80', '#FFFF00', '#FF8000', '#FF4081', '#E91E63'],
ocean: ['#001F3F', '#0074D9', '#7FDBFF', '#39CCCC', '#01FF70', '#2ECC40', '#1ABC9C', '#16A085'],
sunset: ['#FF851B', '#FF4136', '#DC143C', '#B10DC9', '#7B68EE', '#6495ED', '#FF6347', '#FFD700'],
pastel: ['#FFB3E6', '#FFB3B3', '#FFFFB3', '#B3FFB3', '#B3FFFF', '#B3B3FF', '#E6B3FF', '#FFE6B3']
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

const drawComplexMarket = (ctx) => {
ctx.save();
ctx.clearRect(0, 0, 900, 700);
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2.5;
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, 900, 700);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

ctx.strokeRect(50, 120, 800, 480);
ctx.strokeRect(70, 140, 80, 60);
ctx.strokeRect(740, 140, 80, 60);
ctx.strokeRect(410, 550, 80, 50);
ctx.strokeRect(422, 570, 12, 18);
ctx.beginPath();
ctx.moveTo(40, 120);
ctx.lineTo(450, 60);
ctx.lineTo(860, 120);
ctx.stroke();
ctx.strokeRect(380, 80, 140, 40);

for(let i = 0; i < 15; i++) {
ctx.beginPath();
ctx.moveTo(50 + i * 53, 120);
ctx.lineTo(50 + i * 53, 600);
ctx.stroke();
}
for(let i = 0; i < 12; i++) {
ctx.beginPath();
ctx.moveTo(50, 120 + i * 40);
ctx.lineTo(850, 120 + i * 40);
ctx.stroke();
}

ctx.strokeRect(80, 220, 140, 280);
for(let shelf = 0; shelf < 8; shelf++) {
ctx.beginPath();
ctx.moveTo(80, 220 + shelf * 35);
ctx.lineTo(220, 220 + shelf * 35);
ctx.stroke();
}
for(let shelf = 0; shelf < 8; shelf++) {
for(let item = 0; item < 10; item++) {
ctx.strokeRect(85 + item * 13, 225 + shelf * 35, 10, 25);
if(shelf < 3) {
ctx.beginPath();
ctx.arc(90 + item * 13, 232 + shelf * 35, 3, 0, Math.PI * 2);
ctx.stroke();
}
if(shelf >= 3 && shelf < 6) {
ctx.strokeRect(87 + item * 13, 227 + shelf * 35, 6, 20);
}
if(shelf >= 6) {
ctx.beginPath();
ctx.rect(86 + item * 13, 226 + shelf * 35, 8, 8);
ctx.rect(86 + item * 13, 238 + shelf * 35, 8, 12);
ctx.stroke();
}
}
}

ctx.strokeRect(280, 300, 180, 140);
ctx.strokeRect(290, 320, 50, 35);
ctx.strokeRect(350, 320, 50, 35);
ctx.strokeRect(410, 320, 40, 35);
for(let row = 0; row < 4; row++) {
for(let col = 0; col < 8; col++) {
ctx.beginPath();
ctx.arc(295 + col * 6, 325 + row * 7, 2.5, 0, Math.PI * 2);
ctx.stroke();
}
}
for(let row = 0; row < 3; row++) {
for(let col = 0; col < 6; col++) {
ctx.strokeRect(352 + col * 8, 322 + row * 10, 6, 8);
}
}
for(let i = 0; i < 8; i++) {
ctx.beginPath();
ctx.arc(415 + (i%4) * 8, 325 + Math.floor(i/4) * 8, 3, 0, Math.PI * 2);
ctx.stroke();
}

ctx.strokeRect(550, 220, 120, 280);
for(let shelf = 0; shelf < 7; shelf++) {
ctx.beginPath();
ctx.moveTo(550, 220 + shelf * 40);
ctx.lineTo(670, 220 + shelf * 40);
ctx.stroke();
}
for(let shelf = 0; shelf < 7; shelf++) {
for(let bottle = 0; bottle < 8; bottle++) {
ctx.strokeRect(555 + bottle * 14, 225 + shelf * 40, 10, 30);
ctx.strokeRect(557 + bottle * 14, 222 + shelf * 40, 6, 8);
}
}

ctx.strokeRect(720, 280, 100, 180);
for(let shelf = 0; shelf < 4; shelf++) {
ctx.beginPath();
ctx.moveTo(720, 280 + shelf * 45);
ctx.lineTo(820, 280 + shelf * 45);
ctx.stroke();
}
for(let shelf = 0; shelf < 4; shelf++) {
for(let box = 0; box < 6; box++) {
ctx.strokeRect(725 + box * 15, 285 + shelf * 45, 12, 35);
ctx.strokeRect(727 + box * 15, 287 + shelf * 45, 8, 8);
ctx.strokeRect(727 + box * 15, 297 + shelf * 45, 8, 20);
}
}

for(let x = 60; x < 840; x += 30) {
for(let y = 620; y < 680; y += 20) {
ctx.strokeRect(x, y, 25, 15);
ctx.beginPath();
ctx.moveTo(x + 5, y + 5);
ctx.lineTo(x + 20, y + 5);
ctx.moveTo(x + 5, y + 10);
ctx.lineTo(x + 20, y + 10);
ctx.stroke();
}
}

ctx.strokeRect(240, 480, 50, 35);
ctx.beginPath();
ctx.arc(250, 530, 8, 0, Math.PI * 2);
ctx.arc(280, 530, 8, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeRect(245, 455, 40, 25);

ctx.beginPath();
ctx.arc(200, 420, 25, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeRect(180, 445, 40, 45);
ctx.beginPath();
ctx.arc(190, 410, 2, 0, Math.PI * 2);
ctx.arc(210, 410, 2, 0, Math.PI * 2);
ctx.moveTo(190, 425);
ctx.arc(200, 425, 10, 0, Math.PI);
ctx.stroke();
ctx.strokeRect(185, 460, 30, 25);

for(let x = 100; x < 800; x += 100) {
ctx.strokeRect(x, 160, 35, 12);
ctx.beginPath();
ctx.arc(x + 17, 175, 8, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeRect(x + 5, 180, 25, 5);
}

for(let i = 0; i < 20; i++) {
ctx.strokeRect(80 + i * 35, 180 + (i%4) * 15, 15, 8);
ctx.strokeRect(82 + i * 35, 182 + (i%4) * 15, 11, 4);
}

for(let x = 100; x < 600; x += 80) {
for(let y = 240; y < 400; y += 60) {
ctx.strokeRect(x, y, 25, 15);
ctx.strokeRect(x + 30, y, 25, 15);
ctx.beginPath();
ctx.arc(x + 12, y + 7, 5, 0, Math.PI * 2);
ctx.arc(x + 42, y + 7, 5, 0, Math.PI * 2);
ctx.stroke();
}
}

ctx.strokeRect(320, 460, 80, 60);
for(let i = 0; i < 12; i++) {
ctx.strokeRect(325 + (i%4) * 18, 465 + Math.floor(i/4) * 16, 15, 12);
}

for(let i = 0; i < 8; i++) {
ctx.beginPath();
ctx.arc(150 + i * 80, 200, 12, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeRect(142 + i * 80, 215, 16, 20);
}

ctx.strokeRect(500, 450, 60, 40);
for(let i = 0; i < 6; i++) {
ctx.strokeRect(505 + (i%3) * 18, 455 + Math.floor(i/3) * 15, 15, 12);
}

for(let x = 120; x < 700; x += 60) {
ctx.beginPath();
ctx.moveTo(x, 140);
ctx.lineTo(x + 20, 130);
ctx.lineTo(x + 40, 140);
ctx.lineTo(x + 30, 160);
ctx.lineTo(x + 10, 160);
ctx.closePath();
ctx.stroke();
}

ctx.restore();
};

const download = useCallback(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const link = document.createElement('a');
link.download = `bobbie-art-${Date.now()}.png`;
link.href = canvas.toDataURL();
link.click();
}, []);

const clearCanvas = useCallback(() => {
const canvas = canvasRef.current;
const ctx = canvas?.getContext('2d');
if (!ctx) return;
drawComplexMarket(ctx);
saveHistory();
}, [saveHistory]);

useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 700;
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
drawComplexMarket(ctx);
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
<input type="range" min="1" max="50" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer" />
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
<h4 className="text-white/70 text-xs font-medium mb-2 capitalize">{cat}</h4>
<div className="grid grid-cols-4 gap-2">
{cols.map((c, i) => (
<button key={i} onClick={() => setColor(c)} className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${color === c ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'}`} style={{ backgroundColor: c }} />
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
<canvas ref={canvasRef} className="w-full h-auto max-h-[700px] bg-white rounded-lg shadow-2xl cursor-crosshair touch-none" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
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
