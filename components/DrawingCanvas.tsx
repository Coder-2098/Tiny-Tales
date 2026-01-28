
import React, { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4F46E5');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const handleSave = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png');
    if (dataUrl) onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
          <h3 className="text-xl font-bold text-indigo-900 font-kids">Draw Your Idea!</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="flex-1 bg-gray-200 p-4 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={400}
            className="bg-white rounded-xl shadow-inner cursor-crosshair touch-none max-w-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="p-4 bg-white border-t space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#000000'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-gray-400' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium">Size:</span>
              <input 
                type="range" min="1" max="20" value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="flex-1 accent-indigo-600"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                const canvas = canvasRef.current;
                const ctx = canvas?.getContext('2d');
                if (ctx && canvas) ctx.fillRect(0, 0, canvas.width, canvas.height);
              }}
              className="px-6 py-2 rounded-full border border-gray-300 font-medium hover:bg-gray-50"
            >
              Clear
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg"
            >
              Done!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
