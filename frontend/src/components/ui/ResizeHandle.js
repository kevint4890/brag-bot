import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const ResizeHandle = ({ onResize, isVisible = true }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const animationFrameRef = useRef(null);
  const handleRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);

  // Force end dragging - used as escape hatch
  const forceEndDragging = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear any cleanup timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startXRef.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Use pointer capture if available for better event handling
    if (handleRef.current && handleRef.current.setPointerCapture) {
      try {
        handleRef.current.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore if pointer capture fails
      }
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Cancel previous animation frame to prevent choppy movement
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = e.clientX - startXRef.current;
      const containerWidth = window.innerWidth;
      // Fix inverted logic: positive deltaX (drag right) should increase sidebar width
      const deltaPercent = (deltaX / containerWidth) * 100;
      
      // Invert the deltaPercent to fix the inverted movement
      onResize(-deltaPercent);
      startXRef.current = e.clientX;
    });
  }, [isDragging, onResize]);

  const handleMouseUp = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    forceEndDragging();
    
    // Release pointer capture if it was set
    if (handleRef.current && handleRef.current.releasePointerCapture && e?.pointerId) {
      try {
        handleRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore if pointer capture release fails
      }
    }
  }, [forceEndDragging]);

  // Handle mouse leave to prevent stuck dragging
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      // Set a timeout to end dragging if mouse doesn't return quickly
      cleanupTimeoutRef.current = setTimeout(() => {
        forceEndDragging();
      }, 100);
    }
  }, [isDragging, forceEndDragging]);

  const handleMouseEnter = useCallback(() => {
    // Cancel cleanup timeout if mouse returns
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
  }, []);

  // Touch events for mobile support
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = e.touches[0].clientX - startXRef.current;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      
      // Invert the deltaPercent to fix the inverted movement
      onResize(-deltaPercent);
      startXRef.current = e.touches[0].clientX;
    });
  }, [isDragging, onResize]);

  const handleTouchEnd = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    forceEndDragging();
  }, [forceEndDragging]);

  // Keyboard escape handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isDragging) {
      e.preventDefault();
      forceEndDragging();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onResize(-2); // Move 2% left
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onResize(2); // Move 2% right
    }
  }, [isDragging, forceEndDragging, onResize]);

  // Enhanced event listeners with capture and window-level fallbacks
  useEffect(() => {
    if (isDragging) {
      // Document-level listeners with capture for better event handling
      const options = { capture: true, passive: false };
      
      document.addEventListener('mousemove', handleMouseMove, options);
      document.addEventListener('mouseup', handleMouseUp, options);
      document.addEventListener('touchmove', handleTouchMove, options);
      document.addEventListener('touchend', handleTouchEnd, options);
      
      // Window-level listeners as fallback
      window.addEventListener('mousemove', handleMouseMove, options);
      window.addEventListener('mouseup', handleMouseUp, options);
      window.addEventListener('touchmove', handleTouchMove, options);
      window.addEventListener('touchend', handleTouchEnd, options);
      
      // Handle mouse leaving window
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('mouseenter', handleMouseEnter);
      
      // Handle visibility change (tab switching, etc.)
      const handleVisibilityChange = () => {
        if (document.hidden && isDragging) {
          forceEndDragging();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Handle window blur (losing focus)
      const handleWindowBlur = () => {
        if (isDragging) {
          forceEndDragging();
        }
      };
      window.addEventListener('blur', handleWindowBlur);
      
      // Keyboard listener for escape
      document.addEventListener('keydown', handleKeyDown, options);
      
      return () => {
        // Remove all listeners
        document.removeEventListener('mousemove', handleMouseMove, options);
        document.removeEventListener('mouseup', handleMouseUp, options);
        document.removeEventListener('touchmove', handleTouchMove, options);
        document.removeEventListener('touchend', handleTouchEnd, options);
        
        window.removeEventListener('mousemove', handleMouseMove, options);
        window.removeEventListener('mouseup', handleMouseUp, options);
        window.removeEventListener('touchmove', handleTouchMove, options);
        window.removeEventListener('touchend', handleTouchEnd, options);
        
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('mouseenter', handleMouseEnter);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('keydown', handleKeyDown, options);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handleMouseLeave, handleMouseEnter, handleKeyDown, forceEndDragging]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <Box
        ref={handleRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: '6px',
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: isDragging ? 'none' : 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover::before': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scaleY(1)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scaleY(0.3)',
            width: '2px',
            height: '60px',
            backgroundColor: isDragging ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '1px',
            opacity: isDragging ? 1 : 0.6,
            transition: isDragging ? 'none' : 'all 0.2s ease',
            boxShadow: isDragging ? '0 0 8px rgba(255, 255, 255, 0.6)' : 'none',
          },
          '&::after': {
            content: '"⋮⋮"',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            color: isDragging ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
            fontWeight: 'bold',
            letterSpacing: '-2px',
            lineHeight: '8px',
            opacity: isDragging ? 1 : 0.6,
            transition: isDragging ? 'none' : 'opacity 0.2s ease',
            pointerEvents: 'none',
            textShadow: isDragging ? '0 0 4px rgba(255, 255, 255, 0.5)' : 'none',
          },
          // Active state
          ...(isDragging && {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            '&::before': {
              backgroundColor: '#ffffff',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
            },
          }),
        }}
        role="separator"
        aria-label="Resize sidebar (Press Escape to cancel dragging)"
        aria-orientation="vertical"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      />
      
      {/* Dragging Overlay - Prevents interference from underlying elements */}
      {isDragging && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'col-resize',
            backgroundColor: 'rgba(0, 0, 0, 0.01)', // Very subtle background to ensure it captures events
            pointerEvents: 'all', // Ensure it captures all pointer events
            userSelect: 'none',
            touchAction: 'none', // Prevent default touch behaviors
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          onContextMenu={(e) => e.preventDefault()} // Prevent context menu
          onSelectStart={(e) => e.preventDefault()} // Prevent text selection
          onDragStart={(e) => e.preventDefault()} // Prevent drag operations
        />
      )}
    </>
  );
};

export default ResizeHandle;
