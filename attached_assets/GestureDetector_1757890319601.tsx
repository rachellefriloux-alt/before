import { useEffect, useRef } from "react";

interface GestureDetectorProps {
  onTwoFingerSwipe: () => void;
  children: React.ReactNode;
}

export function GestureDetector({ onTwoFingerSwipe, children }: GestureDetectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchesRef = useRef<{ [key: number]: Touch }>({});
  const swipeStartRef = useRef<{ startTime: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isTracking = false;
    const SWIPE_THRESHOLD = 150; // Minimum distance to be considered a swipe
    const TIME_THRESHOLD = 800; // Maximum time for swipe gesture
    const LEFT_EDGE_THRESHOLD = 50; // Must start within 50px of left edge
    const MIDDLE_THRESHOLD = window.innerWidth / 2; // Must end past middle of screen

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if we have exactly 2 touches
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Check if both touches start near the left edge
        if (touch1.clientX <= LEFT_EDGE_THRESHOLD && touch2.clientX <= LEFT_EDGE_THRESHOLD) {
          isTracking = true;
          
          // Calculate average starting position
          const avgX = (touch1.clientX + touch2.clientX) / 2;
          const avgY = (touch1.clientY + touch2.clientY) / 2;
          
          swipeStartRef.current = {
            startTime: Date.now(),
            startX: avgX,
            startY: avgY
          };

          // Store initial touches
          touchesRef.current = {
            [touch1.identifier]: touch1,
            [touch2.identifier]: touch2
          };

          // Prevent default to avoid scrolling
          e.preventDefault();
        }
      } else {
        // Reset if not exactly 2 touches
        isTracking = false;
        touchesRef.current = {};
        swipeStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || !swipeStartRef.current || e.touches.length !== 2) {
        return;
      }

      // Prevent default scrolling during gesture
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTracking || !swipeStartRef.current) {
        return;
      }

      // If we still have touches, wait for all to be released
      if (e.touches.length > 0) {
        return;
      }

      const endTime = Date.now();
      const timeDiff = endTime - swipeStartRef.current.startTime;

      // Check if gesture was within time threshold
      if (timeDiff <= TIME_THRESHOLD) {
        // Get the last recorded positions (from changedTouches)
        if (e.changedTouches.length >= 2) {
          const touch1 = e.changedTouches[0];
          const touch2 = e.changedTouches[1];
          
          const avgEndX = (touch1.clientX + touch2.clientX) / 2;
          const avgEndY = (touch1.clientY + touch2.clientY) / 2;
          
          const deltaX = avgEndX - swipeStartRef.current.startX;
          const deltaY = Math.abs(avgEndY - swipeStartRef.current.startY);
          
          // Check if it's a horizontal swipe from left edge to middle
          if (
            deltaX >= SWIPE_THRESHOLD && // Moved right enough
            avgEndX >= MIDDLE_THRESHOLD && // Ended past middle
            deltaY < SWIPE_THRESHOLD / 2 // Not too much vertical movement
          ) {
            onTwoFingerSwipe();
          }
        }
      }

      // Reset tracking
      isTracking = false;
      touchesRef.current = {};
      swipeStartRef.current = null;
    };

    const handleTouchCancel = () => {
      // Reset on touch cancel
      isTracking = false;
      touchesRef.current = {};
      swipeStartRef.current = null;
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    // Also add mouse events for desktop testing (simulate with two clicks)
    let mouseDownCount = 0;
    let mouseDownTimer: NodeJS.Timeout;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.clientX <= LEFT_EDGE_THRESHOLD) {
        mouseDownCount++;
        
        if (mouseDownCount === 1) {
          mouseDownTimer = setTimeout(() => {
            mouseDownCount = 0;
          }, 500);
        } else if (mouseDownCount === 2) {
          clearTimeout(mouseDownTimer);
          mouseDownCount = 0;
          
          // Simulate swipe from left to middle
          onTwoFingerSwipe();
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDown);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      container.removeEventListener('mousedown', handleMouseDown);
      if (mouseDownTimer) clearTimeout(mouseDownTimer);
    };
  }, [onTwoFingerSwipe]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
}