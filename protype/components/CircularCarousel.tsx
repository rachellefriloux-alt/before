import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface CarouselTab {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  notifications?: number;
  urgent?: boolean;
  timeRelevant?: boolean;
}

interface CircularCarouselProps {
  tabs: CarouselTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CircularCarousel({ tabs, activeTab, onTabChange, isOpen, onClose }: CircularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(() => 
    tabs.findIndex(tab => tab.id === activeTab) || 0
  );
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 80;
  const VISIBLE_ITEMS = 1;

  // Update current index when activeTab changes
  useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  }, [activeTab, tabs]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    setDragOffset(info.offset.y);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    setDragOffset(0);

    const threshold = ITEM_HEIGHT / 3;
    
    if (Math.abs(info.offset.y) > threshold) {
      let newIndex = currentIndex;
      
      if (info.offset.y > 0) {
        // Dragged down - go to previous item
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        // Dragged up - go to next item
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }
      
      setCurrentIndex(newIndex);
      onTabChange(tabs[newIndex].id);
    }
  };

  const handleTabClick = (tabId: string, index: number) => {
    setCurrentIndex(index);
    onTabChange(tabId);
    onClose();
  };

  const currentTab = tabs[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Circular Carousel Container */}
          <motion.div
            ref={containerRef}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-8 top-1/2 -translate-y-1/2 z-50"
          >
            {/* Main Circular Display */}
            <div className="relative">
              {/* Current Tab Display */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                className="relative cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.05 }}
              >
                <div 
                  className="w-20 h-20 rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-md flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${currentTab.color.replace('bg-', '')} 0%, ${currentTab.color.replace('bg-', '')}/80 100%)`,
                    transform: `translateY(${dragOffset * 0.3}px)`
                  }}
                >
                  {/* Icon */}
                  <div className="text-white relative z-10">
                    {currentTab.icon}
                  </div>

                  {/* Notifications Badge */}
                  {currentTab.notifications && currentTab.notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-medium shadow-lg"
                    >
                      {currentTab.notifications > 9 ? '9+' : currentTab.notifications}
                    </Badge>
                  )}

                  {/* Urgent Indicator */}
                  {currentTab.urgent && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                  )}

                  {/* Time Relevant Indicator */}
                  {currentTab.timeRelevant && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
                  )}

                  {/* Glassmorphic overlay */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full" />
                </div>
              </motion.div>

              {/* Context Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-4 text-center"
              >
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg border border-white/20">
                  {currentTab.name}
                </div>
              </motion.div>

              {/* Selection Indicators */}
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2">
                {tabs.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white shadow-lg scale-125' 
                        : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Drag Hint */}
              {!isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 1 }}
                  className="absolute -left-16 top-1/2 -translate-y-1/2 text-white/60 text-xs"
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-center leading-tight">
                      Drag<br />to<br />scroll
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Select Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              className="mt-6 flex justify-center"
            >
              <Button
                onClick={() => handleTabClick(currentTab.id, currentIndex)}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors shadow-lg"
              >
                Select {currentTab.shortName}
              </Button>
            </motion.div>

            {/* Close hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center"
            >
              Tap outside to close
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}