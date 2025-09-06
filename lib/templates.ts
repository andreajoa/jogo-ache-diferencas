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
      ctx.fillStyle = '#FF69B4'; // Hot pink
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 5, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
    
    // Path
    ctx.fillStyle = '#D2B48C'; // Tan
    ctx.fillRect(50, 230, 300, 20);
    ctx.strokeRect(50, 230, 300, 20);
  },
  
  animais: (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Background
    ctx.fillStyle = '#E0F6FF'; // Light blue
    ctx.fillRect(0, 0, 400, 300);
    
    // Cat
    ctx.fillStyle = '#FFA500'; // Orange
    
    // Cat body
    ctx.beginPath();
    ctx.arc(150, 200, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Cat head
    ctx.beginPath();
    ctx.arc(140, 160, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Cat ears
    ctx.beginPath();
    ctx.moveTo(130, 150);
    ctx.lineTo(125, 135);
    ctx.lineTo(135, 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(155, 135);
    ctx.lineTo(145, 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Cat tail
    ctx.beginPath();
    ctx.arc(175, 185, 8, 0, Math.PI);
    ctx.stroke();
    
    // Cat eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(135, 155, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(145, 155, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dog
    ctx.fillStyle = '#8B4513'; // Brown
    
    // Dog body
    ctx.beginPath();
    ctx.arc(280, 220, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Dog head
    ctx.beginPath();
    ctx.arc(270, 180, 18, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Dog ears
    ctx.fillStyle = '#654321'; // Dark brown
    ctx.beginPath();
    ctx.arc(260, 170, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(280, 170, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dog eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(265, 175, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(275, 175, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bird
    ctx.fillStyle = '#FF0000'; // Red
    ctx.beginPath();
    ctx.arc(320, 120, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Bird wing
    ctx.beginPath();
    ctx.ellipse(310, 120, 8, 4, -Math.PI/4, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Bird beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(315, 120);
    ctx.lineTo(305, 118);
    ctx.lineTo(305, 122);
    ctx.closePath();
    ctx.fill();
  },
  
  escola: (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 400, 120);
    
    // Ground
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 120, 400, 180);
    
    // School building
    ctx.fillStyle = '#DC143C'; // Crimson
    ctx.fillRect(120, 120, 160, 120);
    ctx.strokeRect(120, 120, 160, 120);
    
    // School roof
    ctx.fillStyle = '#8B0000'; // Dark red
    ctx.beginPath();
    ctx.moveTo(110, 120);
    ctx.lineTo(200, 80);
    ctx.lineTo(290, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // School windows
    ctx.fillStyle = '#ADD8E6';
    const windows = [
      {x: 140, y: 140}, {x: 180, y: 140}, {x: 220, y: 140},
      {x: 140, y: 180}, {x: 220, y: 180}
    ];
    
    windows.forEach(win => {
      ctx.fillRect(win.x, win.y, 20, 20);
      ctx.strokeRect(win.x, win.y, 20, 20);
      // Window cross
      ctx.beginPath();
      ctx.moveTo(win.x + 10, win.y);
      ctx.lineTo(win.x + 10, win.y + 20);
      ctx.moveTo(win.x, win.y + 10);
      ctx.lineTo(win.x + 20, win.y + 10);
      ctx.stroke();
    });
    
    // School door
    ctx.fillStyle = '#654321';
    ctx.fillRect(185, 200, 25, 40);
    ctx.strokeRect(185, 200, 25, 40);
    
    // Flag pole
    ctx.strokeRect(320, 120, 3, 80);
    
    // Flag
    ctx.fillStyle = '#00FF00'; // Green
    ctx.fillRect(323, 120, 30, 20);
    ctx.strokeRect(323, 120, 30, 20);
    
    // Playground equipment
    ctx.strokeRect(300, 200, 80, 60);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(300, 200, 80, 60);
    ctx.strokeRect(300, 200, 80, 60);
  },
  
  livre: (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    
    // Background
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, 400, 300);
    
    // Grid
    const gridSize = 20;
    
    // Vertical lines
    for (let x = 0; x <= 400; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 300);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= 300; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(400, y);
      ctx.stroke();
    }
    
    // Center guides
    ctx.strokeStyle = '#CCCCCC';
    ctx.setLineDash([5, 5]);
    
    // Vertical center
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 300);
    ctx.stroke();
    
    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(400, 150);
    ctx.stroke();
    
    ctx.setLineDash([]);
  }
};

// 📁 app/lib/utils.ts
export const downloadImage = (canvas: HTMLCanvasElement, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const resizeCanvas = (canvas: HTMLCanvasElement, maxWidth: number = 400, maxHeight: number = 300) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store current content
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Resize
  canvas.width = maxWidth;
  canvas.height = maxHeight;
  
  // Restore content
  ctx.putImageData(imageData, 0, 0);
};

export const optimizeCanvas = (canvas: HTMLCanvasElement): string => {
  // Convert to WebP if supported, otherwise PNG
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return canvas.toDataURL('image/webp', 0.8);
  }
  return canvas.toDataURL('image/png');
};

// 📁 package.json
{
  "name": "jogo-ache-diferencas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "@tailwindcss/forms": "^0.5.7"
  }
}

// 📁 tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

// 📁 next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  trailingSlash: true,
  output: 'export',
}

module.exports = nextConfig

// 📁 app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jogo Ache as Diferenças - Neuropsicopedagogia',
  description: 'Crie atividades personalizadas para desenvolver atenção e foco das crianças. Ferramenta profissional para neuropsicopedagogos.',
  keywords: 'neuropsicopedagogia, TDAH, autismo, jogos educativos, atenção, foco',
  authors: [{ name: 'Margareth Oliveira de Almeida' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#4c51bf',
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

// 📁 app/globals.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply text-gray-900 bg-white;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}

@layer components {
  .glass {
    @apply bg-white/80 backdrop-blur-md border border-white/20;
  }
  
  .btn-glass {
    @apply glass px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/90 hover:scale-105;
  }
}

/* Canvas optimizations */
canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Touch improvements */
.touch-none {
  touch-action: none;
}

/* Print styles */
@media print {
  @page {
    margin: 0.5in;
  }
  
  body * {
    visibility: hidden;
  }
  
  .print-area,
  .print-area * {
    visibility: visible;
  }
  
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  
  canvas {
    max-width: 100% !important;
    height: auto !important;
  }
}

/* PWA styles */
@media (display-mode: standalone) {
  body {
    padding-top: env(safe-area-inset-top);
  }
}
