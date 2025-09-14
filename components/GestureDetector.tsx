
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
        }
      } else {
        // Reset if not exactly 2 touches
        isTracking = false;
        swipeStartRef.current = null;
        touchesRef.current = {};
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking || !swipeStartRef.current || e.touches.length !== 2) {
        return;
      }

      // Prevent default scrolling behavior during gesture
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTracking || !swipeStartRef.current) {
        return;
      }

      // Check if we still have at least one touch that was part of the gesture
      const remainingTouches = Array.from(e.touches);
      const hasOriginalTouch = remainingTouches.some(touch => 
        touchesRef.current[touch.identifier]
      );

      // If no more touches or gesture is complete
      if (e.touches.length === 0 || !hasOriginalTouch) {
        const currentTime = Date.now();
        const timeDiff = currentTime - swipeStartRef.current.startTime;
        
        // Get the last known position (use changedTouches for the touch that just ended)
        let endX = swipeStartRef.current.startX;
        
        if (e.changedTouches.length > 0) {
          // Use the first changed touch as reference
          endX = e.changedTouches[0].clientX;
        } else if (remainingTouches.length > 0) {
          // Use remaining touch if available
          endX = remainingTouches[0].clientX;
        }
        
        const distance = endX - swipeStartRef.current.startX;
        
        // Check if this qualifies as a valid swipe gesture
        if (
          timeDiff <= TIME_THRESHOLD && // Within time limit
          distance >= SWIPE_THRESHOLD && // Minimum distance
          endX >= MIDDLE_THRESHOLD // Ends past middle of screen
        ) {
          onTwoFingerSwipe();
        }
        
        // Reset tracking
        isTracking = false;
        swipeStartRef.current = null;
        touchesRef.current = {};
      }
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onTwoFingerSwipe]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {children}
    </div>
  );
}
