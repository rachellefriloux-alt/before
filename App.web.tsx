
import { useState } from "react";
import { CircularCarousel } from "./components/CircularCarousel";
import { GestureDetector } from "./components/GestureDetector";
import { AIAssistantBar } from "./components/AIAssistantBar";
import { AppDrawer } from "./components/AppDrawer";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { 
  Briefcase, 
  Home, 
  Heart, 
  DollarSign, 
  BookOpen, 
  Dumbbell,
  Calendar,
  Mail,
  Phone,
  Camera,
  Music,
  Settings,
  UserCheck,
  TrendingUp,
  Clock,
  CheckSquare,
  Grid3X3,
  Search,
  MessageCircle,
  Calculator,
  MapPin,
  Image,
  FileText,
  Video,
  Globe,
  ShoppingCart,
  Gamepad2,
  Users,
  Brain,
  Zap,
  AlertCircle
} from "lucide-react";

export default function App() {
  const [activeContext, setActiveContext] = useState("work");
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  const carouselTabs = [
    { 
      id: "work", 
      name: "Work",
      shortName: "Work",
      icon: <Briefcase className="h-5 w-5" />, 
      color: "bg-blue-500",
      notifications: 3,
      timeRelevant: true
    },
    { 
      id: "mom", 
      name: "Mom",
      shortName: "Mom",
      icon: <Heart className="h-5 w-5" />, 
      color: "bg-pink-500",
      notifications: 1
    },
    { 
      id: "personal", 
      name: "Personal",
      shortName: "Me",
      icon: <Home className="h-5 w-5" />, 
      color: "bg-green-500"
    },
    { 
      id: "social", 
      name: "Social",
      shortName: "Social",
      icon: <Users className="h-5 w-5" />, 
      color: "bg-purple-500",
      notifications: 8,
      urgent: true
    },
    { 
      id: "health", 
      name: "Health & Fitness",
      shortName: "Health",
      icon: <Dumbbell className="h-5 w-5" />, 
      color: "bg-orange-500"
    },
    { 
      id: "finance", 
      name: "Finance",
      shortName: "Money",
      icon: <DollarSign className="h-5 w-5" />, 
      color: "bg-yellow-500"
    },
    { 
      id: "learning", 
      name: "Learning",
      shortName: "Learn",
      icon: <BookOpen className="h-5 w-5" />, 
      color: "bg-indigo-500"
    }
  ];

  const getContextContent = () => {
    switch (activeContext) {
      case "work":
        return {
          title: "Work Context",
          aiSuggestions: [
            {
              type: 'productivity' as const,
              message: 'Focus session starting in 10 minutes. Prepare your workspace.',
              action: 'Start Focus Mode'
            },
            {
              type: 'reminder' as const,
              message: 'Quarterly review meeting at 3 PM today.',
              action: 'Set Reminder'
            }
          ],
          currentFocus: "Deep Work",
          productivityScore: 87,
          quickActions: [
            { label: "Start Deep Work", icon: <Clock className="h-4 w-4" />, urgent: true },
            { label: "Check Priority Inbox", icon: <Mail className="h-4 w-4" /> },
            { label: "Review Meetings", icon: <Calendar className="h-4 w-4" /> },
            { label: "Update Status", icon: <CheckSquare className="h-4 w-4" /> }
          ]
        };
      case "mom":
        return {
          title: "Mom Context",
          aiSuggestions: [
            {
              type: 'reminder' as const,
              message: "Mom's birthday is next week. Time to plan something special!",
              action: 'Plan Birthday'
            },
            {
              type: 'productivity' as const,
              message: "Call mom - you haven't talked in 3 days.",
              action: 'Call Now'
            }
          ],
          currentFocus: "Family Time",
          productivityScore: 92,
          quickActions: [
            { label: "Call Mom", icon: <Phone className="h-4 w-4" />, urgent: true },
            { label: "Send Photo", icon: <Camera className="h-4 w-4" /> },
            { label: "Plan Visit", icon: <Calendar className="h-4 w-4" /> },
            { label: "Gift Ideas", icon: <Heart className="h-4 w-4" /> }
          ]
        };
      case "personal":
        return {
          title: "Personal Context",
          aiSuggestions: [
            {
              type: 'optimization' as const,
              message: 'You have some personal tasks to catch up on.',
              action: 'Review Tasks'
            }
          ],
          currentFocus: "Self Care",
          productivityScore: 75,
          quickActions: [
            { label: "Personal Tasks", icon: <CheckSquare className="h-4 w-4" /> },
            { label: "Plan Weekend", icon: <Calendar className="h-4 w-4" /> },
            { label: "Photo Backup", icon: <Camera className="h-4 w-4" /> },
            { label: "Music Playlist", icon: <Music className="h-4 w-4" /> }
          ]
        };
      case "health":
        return {
          title: "Health & Fitness",
          aiSuggestions: [
            {
              type: 'reminder' as const,
              message: 'Time for your afternoon water reminder.',
              action: 'Log Water'
            },
            {
              type: 'productivity' as const,
              message: 'Great job on your morning workout! Log your progress.',
              action: 'Log Workout'
            }
          ],
          currentFocus: "Wellness",
          productivityScore: 82,
          quickActions: [
            { label: "Track Workout", icon: <Dumbbell className="h-4 w-4" /> },
            { label: "Log Meals", icon: <CheckSquare className="h-4 w-4" /> },
            { label: "Water Reminder", icon: <Clock className="h-4 w-4" />, urgent: true },
            { label: "Health Stats", icon: <TrendingUp className="h-4 w-4" /> }
          ]
        };
      default:
        return {
          title: "Default Context",
          aiSuggestions: [],
          currentFocus: "General",
          productivityScore: 80,
          quickActions: []
        };
    }
  };

  const handleAppLaunch = (appName: string) => {
    console.log("Launching app:", appName);
    // Here you would integrate with your Android launcher
  };

  const handleActionClick = (action: string) => {
    console.log("Action clicked:", action);
    // Handle specific actions
  };

  const handleTwoFingerSwipe = () => {
    setShowCarousel(true);
  };

  const handleCarouselClose = () => {
    setShowCarousel(false);
  };

  const handleTabChange = (tabId: string) => {
    setActiveContext(tabId);
  };

  const contextContent = getContextContent();

  if (showAppDrawer) {
    return <AppDrawer onClose={() => setShowAppDrawer(false)} />;
  }

  return (
    <GestureDetector onTwoFingerSwipe={handleTwoFingerSwipe}>
      <div className="min-h-screen bg-background">
        <ScrollArea className="h-screen">
          <div className="p-4 space-y-6">
            {/* Context Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${carouselTabs.find(tab => tab.id === activeContext)?.color}`}>
                  {carouselTabs.find(tab => tab.id === activeContext)?.icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{contextContent.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Focus: {contextContent.currentFocus}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {contextContent.productivityScore}% Productive
              </Badge>
            </div>

            {/* AI Assistant Bar */}
            <AIAssistantBar 
              suggestions={contextContent.aiSuggestions}
              currentFocus={contextContent.currentFocus}
              productivityScore={contextContent.productivityScore}
            />

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {contextContent.quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.urgent === true ? "default" : "outline"}
                    className="h-16 flex-col gap-2"
                    onClick={() => handleActionClick(action.label)}
                  >
                    {action.icon}
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Context-Specific Content */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">3 meetings scheduled</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Today</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span className="text-sm">5 tasks remaining</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Priority</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">2 unread messages</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">New</Badge>
                </div>
              </div>
            </Card>

            {/* Padding for bottom navigation */}
            <div className="h-24" />
          </div>
        </ScrollArea>

        {/* Circular Carousel - Overlay */}
        <CircularCarousel
          tabs={carouselTabs}
          activeTab={activeContext}
          onTabChange={handleTabChange}
          isOpen={showCarousel}
          onClose={handleCarouselClose}
        />

        {/* Floating App Drawer Button */}
        <div className="fixed bottom-20 right-6 z-20">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setShowAppDrawer(true)}
          >
            <Grid3X3 className="h-6 w-6" />
          </Button>
        </div>

        {/* Bottom Quick Access Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 h-auto py-2"
              onClick={() => setShowAppDrawer(true)}
            >
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 h-auto py-2"
              onClick={() => handleAppLaunch('Phone')}
            >
              <Phone className="h-5 w-5" />
              <span className="text-xs">Phone</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 h-auto py-2"
              onClick={() => handleAppLaunch('Messages')}
            >
              <Mail className="h-5 w-5" />
              <span className="text-xs">Messages</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="flex-col gap-1 h-auto py-2"
              onClick={() => handleAppLaunch('Camera')}
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs">Camera</span>
            </Button>
          </div>
        </div>

        {/* Gesture Hint - Only show when no carousel is open */}
        {!showCarousel && (
          <div className="fixed left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs z-10">
            <div className="flex flex-col items-center space-y-1 rotate-90">
              <div className="text-center text-[10px] leading-none">
                2 fingers
              </div>
              <div className="w-4 h-px bg-muted-foreground/30" />
            </div>
          </div>
        )}
      </div>
    </GestureDetector>
  );
}
