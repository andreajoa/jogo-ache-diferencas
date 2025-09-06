// 📁 app/lib/templates.ts
export const templates = {
  casa: (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#87CEEB'; // Sky blue
    
    // Sky
    ctx.fillRect(0, 0, 400, 150);
    
    // Ground
    ctx.fillStyle = '#90EE90'; // Light green
    ctx.fillRect(0, 150, 400, 150);
    
    ctx.strokeStyle = '#333';
    
    // House
    ctx.fillStyle = '#DEB887'; // Tan
    ctx.fillRect(150, 150, 100, 80);
    ctx.strokeRect(150, 150, 100, 80);
    
    // Roof
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.beginPath();
    ctx.moveTo(140, 150);
    ctx.lineTo(200, 100);
    ctx.lineTo(260, 150);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Door
    ctx.fillStyle = '#654321'; // Dark brown
    ctx.fillRect(170, 180, 20, 50);
    ctx.strokeRect(170, 180, 20, 50);
    
    // Window
    ctx.fillStyle = '#ADD8E6'; // Light blue
    ctx.fillRect(200, 170, 20, 20);
    ctx.strokeRect(200, 170, 20, 20);
    
    // Sun
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    ctx.arc(320, 80, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = 320 + Math.cos(angle) * 30;
      const y1 = 80 + Math.sin(angle) * 30;
      const x2 = 320 + Math.cos(angle) * 40;
      const y2 = 80 + Math.sin(angle) * 40;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // Cloud
    ctx.fillStyle = '#FFFFFF'; // White
    ctx.beginPath();
    ctx.arc(80, 60, 15, 0, 2 * Math.PI);
    ctx.arc(95, 50, 20, 0, 2 * Math.PI);
    ctx.arc(110, 60, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  },
  
  parque: (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 400, 180);
    
    // Grass
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.fillRect(0, 180, 400, 120);
    
    // Tree trunk
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(180, 180, 15, 50);
    ctx.strokeRect(180, 180, 15, 50);
    
    // Tree leaves
    ctx.fillStyle = '#00FF00'; // Lime
    ctx.beginPath();
    ctx.arc(187, 160, 35, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Bench
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.fillRect(280, 200, 80, 12);
    ctx.strokeRect(280, 200, 80, 12);
    
    // Bench legs
    ctx.fillRect(290, 212, 8, 25);
    ctx.fillRect(342, 212, 8, 25);
    ctx.strokeRect(290, 212, 8, 25);
    ctx.strokeRect(342, 212, 8, 25);
    
    // Flowers
    const flowerPositions = [
      { x: 100, y: 220 },
      { x: 130, y: 210 },
      { x: 320, y: 240 }
    ];
    
    flowerPositions.forEach(pos => {
      // Stem
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(pos.x - 2, pos.y, 4, 20);
      
      // Flower
      ctx.fillStyle = '#FF69B4';
