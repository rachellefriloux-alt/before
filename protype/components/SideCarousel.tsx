import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";

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

interface SideCarouselProps {
  tabs: CarouselTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SideCarousel({ tabs, activeTab, onTabChange }: SideCarouselProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed left-0 top-0 bottom-0 z-30 flex">
      {/* Side Carousel */}
      <motion.div 
        className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-r shadow-lg"
        initial={{ width: "64px" }}
        animate={{ width: isExpanded ? "200px" : "64px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <ScrollArea className="h-full">
          <div className="py-4 px-2 space-y-2">
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                className="relative"
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <Button
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`
                    w-full h-12 relative overflow-hidden transition-all duration-200
                    ${activeTab === tab.id ? 'shadow-md' : 'hover:bg-accent'}
                    ${isExpanded ? 'justify-start px-3' : 'justify-center px-0'}
                  `}
                  onClick={() => onTabChange(tab.id)}
                >
                  {/* Icon Container */}
                  <div className="relative shrink-0">
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${activeTab === tab.id ? 'bg-primary-foreground/10' : tab.color}
                    `}>
                      {tab.icon}
                    </div>
                    
                    {/* Notifications Badge */}
                    {tab.notifications && tab.notifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                      >
                        {tab.notifications > 9 ? '9+' : tab.notifications}
                      </Badge>
                    )}
                    
                    {/* Urgent Indicator */}
                    {tab.urgent && (
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    
                    {/* Time Relevant Indicator */}
                    {tab.timeRelevant && (
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 truncate"
                      >
                        <span className="text-sm font-medium">{tab.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                {/* Active Tab Indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}

                {/* Hover Tooltip for Collapsed State */}
                <AnimatePresence>
                  {!isExpanded && hoveredTab === tab.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-16 top-1/2 -translate-y-1/2 z-50 bg-popover text-popover-foreground p-2 rounded-md shadow-lg border text-sm whitespace-nowrap pointer-events-none"
                    >
                      {tab.name}
                      {tab.notifications && tab.notifications > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs">
                          {tab.notifications}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Expansion Hint */}
        {!isExpanded && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center space-y-1 opacity-50">
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}