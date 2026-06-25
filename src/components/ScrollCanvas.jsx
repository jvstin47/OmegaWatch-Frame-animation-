import React, { useRef, useEffect, useState } from 'react';

export default function ScrollCanvas({ 
  loader,
  startFrame = 1, 
  endFrame = 300, 
  containerRef, 
  scrollMode = 'sticky', 
  className = '', 
  overlay = null,
  hudSpecs = null
}) {
  const canvasRef = useRef(null);
  
  // Throttle React state updates to only when HUD stages cross boundaries (usually 4 times per scroll sequence)
  const [activeSpecIndex, setActiveSpecIndex] = useState(0);
  
  const [loadedPercent, setLoadedPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const drawFrameRef = useRef(null);
  const lastProgressRef = useRef(0);
  const lastSpecIndexRef = useRef(0);
  const isDrawingRef = useRef(false);

  // Background preload inside canvas
  useEffect(() => {
    loader.start(
      (pct) => setLoadedPercent(pct),
      () => setIsComplete(true)
    );
  }, [loader]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas.parentNode) return;
      const rect = canvas.parentNode.getBoundingClientRect();
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      drawFrame(lastProgressRef.current);
    };

    const drawFrame = (progress) => {
      const totalFrames = endFrame - startFrame + 1;
      let frameIndex = Math.floor(progress * (totalFrames - 1)) + startFrame;
      frameIndex = Math.min(endFrame, Math.max(startFrame, frameIndex));

      const img = loader.getFrame(frameIndex);
      if (!img) return;

      const rect = canvas.parentNode.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const imgRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, x, y;
      
      // Fine-tuned framing padding
      const scaleFactor = 0.88;

      if (imgRatio > canvasRatio) {
        drawWidth = canvasWidth * scaleFactor;
        drawHeight = drawWidth / imgRatio;
      } else {
        drawHeight = canvasHeight * scaleFactor;
        drawWidth = drawHeight * imgRatio;
      }

      x = (canvasWidth - drawWidth) / 2;
      y = (canvasHeight - drawHeight) / 2;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    drawFrameRef.current = drawFrame;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let progress = 0;

      if (scrollMode === 'sticky') {
        const scrolled = -rect.top;
        const totalHeight = rect.height - windowHeight;
        progress = totalHeight > 0 ? scrolled / totalHeight : 0;
      } else {
        const entryPoint = rect.top - windowHeight;
        const totalRange = windowHeight + rect.height;
        progress = -entryPoint / totalRange;
      }

      progress = Math.min(1, Math.max(0, progress));
      lastProgressRef.current = progress;

      // Only update React state when crossing category boundaries
      if (hudSpecs && hudSpecs.length > 0) {
        let newSpecIndex = hudSpecs.length - 1;
        for (let i = 0; i < hudSpecs.length; i++) {
          if (progress <= hudSpecs[i].limit) {
            newSpecIndex = i;
            break;
          }
        }
        if (newSpecIndex !== lastSpecIndexRef.current) {
          lastSpecIndexRef.current = newSpecIndex;
          setActiveSpecIndex(newSpecIndex);
        }
      }

      // Throttle canvas draw calls to match refresh rate
      if (!isDrawingRef.current) {
        isDrawingRef.current = true;
        requestAnimationFrame(() => {
          drawFrame(lastProgressRef.current);
          isDrawingRef.current = false;
        });
      }
    };

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(canvas.parentNode);

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial draw
    handleScroll();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [startFrame, endFrame, containerRef, scrollMode, loader, hudSpecs]);

  // Redraw when new high-resolution frames load
  useEffect(() => {
    if (drawFrameRef.current) {
      drawFrameRef.current(lastProgressRef.current);
    }
  }, [loadedPercent]);

  // Get active HUD spec based on current state index
  const activeSpec = hudSpecs && hudSpecs.length > 0 ? hudSpecs[activeSpecIndex] : null;

  return (
    <div className={`canvas-container ${className}`} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', zIndex: 1 }} />
      {overlay}
      
      {/* Subtle, premium monospaced in-canvas load state */}
      {!isComplete && loadedPercent < 100 && (
        <div className="canvas-loader-indicator">
          <span className="canvas-loader-indicator__pulse" />
          <span className="canvas-loader-indicator__text">PRELOADING SCHEMATIC... {loadedPercent}%</span>
        </div>
      )}

      {/* Editorial HUD metadata overlay */}
      {activeSpec && (
        <div className="hud-badge">
          <div className="hud-badge__header">
            <div className="hud-badge__pulse" />
            <span className="hud-badge__stage">{activeSpec.stage}</span>
          </div>
          <div className="hud-badge__main">
            {activeSpec.title}
          </div>
          <div className="hud-badge__stats">
            <span className="hud-badge__stat">{activeSpec.stats[0]}</span>
            <span className="hud-badge__separator">•</span>
            <span className="hud-badge__stat">{activeSpec.stats[1]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
