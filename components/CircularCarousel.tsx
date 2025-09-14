
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Carousel Container */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed left-0 top-0 bottom-0 w-24 z-50 flex items-center"
          >
            <div 
              ref={containerRef}
              className="relative w-full h-full flex flex-col items-center justify-center"
            >
              {/* Tab List */}
              <motion.div
                className="relative"
                style={{
                  y: dragOffset,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                dragElastic={0.2}
              >
                {tabs.map((tab, index) => {
                  const isActive = index === currentIndex;
                  const distance = Math.abs(index - currentIndex);
                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
                  const scale = distance === 0 ? 1 : distance === 1 ? 0.8 : 0.6;
                  const yOffset = (index - currentIndex) * ITEM_HEIGHT;

                  return (
                    <motion.div
                      key={tab.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        y: yOffset - ITEM_HEIGHT / 2,
                        x: -32, // Half of w-16
                        opacity,
                        scale,
                        zIndex: isActive ? 10 : 5 - distance,
                      }}
                      animate={{
                        y: yOffset - ITEM_HEIGHT / 2,
                        opacity,
                        scale,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="lg"
                        className={`
                          relative w-16 h-16 rounded-full shadow-lg
                          ${tab.color} 
                          ${isActive ? 'ring-2 ring-white' : ''}
                          ${tab.urgent ? 'ring-2 ring-red-500 animate-pulse' : ''}
                        `}
                        onClick={() => handleTabClick(tab.id, index)}
                      >
                        <div className="flex flex-col items-center">
                          {tab.icon}
                          {tab.notifications && tab.notifications > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                              {tab.notifications > 9 ? '9+' : tab.notifications}
                            </Badge>
                          )}
                          {tab.timeRelevant && (
                            <div className="absolute -bottom-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Current Tab Label */}
              <motion.div
                key={currentTab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-20 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg border"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentTab.color}`} />
                  <span className="font-medium text-sm whitespace-nowrap">
                    {currentTab.name}
                  </span>
                </div>
                {currentTab.notifications && currentTab.notifications > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentTab.notifications} notification{currentTab.notifications !== 1 ? 's' : ''}
                  </div>
                )}
              </motion.div>

              {/* Navigation Hint */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 text-xs">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-px h-6 bg-white/30" />
                  <div className="text-center text-[10px] leading-none">
                    drag
                  </div>
                  <div className="w-px h-6 bg-white/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
