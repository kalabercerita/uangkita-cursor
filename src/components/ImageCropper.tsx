
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImageCropperProps {
  imageUrl: string;
  aspect?: number;
  onCrop: (croppedImageUrl: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspect = 1,
  onCrop,
  open,
  onOpenChange,
}) => {
  const [scale, setScale] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.onload = () => {
      // Once image is loaded, set dimensions for proper initialization
      setImageDimensions({ width: img.width, height: img.height });
      
      // Center the image initially
      if (canvasRef.current) {
        const canvasSize = canvasRef.current.width;
        const imgAspect = img.width / img.height;
        
        let scaledWidth, scaledHeight;
        
        if (imgAspect > 1) {
          // Landscape image
          scaledHeight = canvasSize;
          scaledWidth = scaledHeight * imgAspect;
        } else {
          // Portrait image or square
          scaledWidth = canvasSize;
          scaledHeight = scaledWidth / imgAspect;
        }
        
        // Calculate the initial position to center the image
        setPosition({
          x: (canvasSize - scaledWidth) / 2,
          y: (canvasSize - scaledHeight) / 2
        });
      }
      
      // Set image source for the reference element
      if (imageRef.current) {
        imageRef.current.src = imageUrl;
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw the cropping preview whenever scale or position changes
  useEffect(() => {
    drawCanvas();
  }, [scale, position, imageDimensions]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !imageRef.current.complete) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width; // Square canvas
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw the image with scaling and positioning
    const img = imageRef.current;
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    ctx.drawImage(
      img,
      // Source rectangle
      0, 0, img.width, img.height,
      // Destination rectangle (with offset for panning)
      position.x, position.y, scaledWidth, scaledHeight
    );
    
    // Draw circular crop overlay
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Draw circular outline
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(true);
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({
      x: touch.clientX - rect.left - position.x,
      y: touch.clientY - rect.top - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - rect.left - dragStart.x,
      y: touch.clientY - rect.top - dragStart.y
    });
    
    // Prevent page scrolling while dragging
    e.preventDefault();
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;
    
    // Get the data URL from the canvas
    const croppedImageUrl = canvasRef.current.toDataURL('image/png');
    onCrop(croppedImageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Foto Profil</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4">
          {/* Hidden image element for reference */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
            onLoad={() => drawCanvas()}
          />
          
          {/* Canvas for cropping */}
          <div className="relative overflow-hidden w-full aspect-square rounded-full bg-muted flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="cursor-move touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            />
          </div>
          
          {/* Controls for zoom */}
          <div className="w-full flex flex-col gap-2">
            <label className="text-sm">Zoom:</label>
            <Slider
              value={[scale]}
              min={0.5}
              max={3}
              step={0.01}
              onValueChange={(values) => setScale(values[0])}
            />
          </div>
          
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleCrop} className="bg-gradient-to-r from-finance-teal to-finance-purple">
              Crop & Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
