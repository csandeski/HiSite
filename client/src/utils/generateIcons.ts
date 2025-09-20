// Utility to generate PWA icons programmatically using canvas

export function generatePWAIcons() {
  const sizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];
  
  sizes.forEach(size => {
    generateIcon(size);
  });
}

function generateIcon(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#7c3aed');
  gradient.addColorStop(1, '#5b21b6');
  
  // Draw rounded square background
  const radius = size * 0.15;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  // Draw radio/play icon
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw play triangle
  const centerX = size / 2;
  const centerY = size / 2;
  const triangleSize = size * 0.3;
  
  ctx.beginPath();
  ctx.moveTo(centerX - triangleSize * 0.3, centerY - triangleSize * 0.5);
  ctx.lineTo(centerX - triangleSize * 0.3, centerY + triangleSize * 0.5);
  ctx.lineTo(centerX + triangleSize * 0.4, centerY);
  ctx.closePath();
  ctx.fill();
  
  // Draw radio waves
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.02;
  ctx.setLineDash([size * 0.05, size * 0.05]);
  
  // Right wave
  ctx.beginPath();
  ctx.arc(centerX + triangleSize * 0.6, centerY, triangleSize * 0.3, -Math.PI/4, Math.PI/4, false);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(centerX + triangleSize * 0.6, centerY, triangleSize * 0.5, -Math.PI/4, Math.PI/4, false);
  ctx.stroke();
  
  // Convert to blob and download (for development)
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icon-${size}x${size}.png`;
      // Uncomment to auto-download during development
      // a.click();
      URL.revokeObjectURL(url);
    }
  });
  
  return canvas.toDataURL('image/png');
}