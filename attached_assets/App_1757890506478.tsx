import { useState } from "react";
import { CircularCarousel } from "./components/CircularCarousel";
import { GestureDetector } from "./components/GestureDetector";
import { ContextScreen } from "./components/ContextScreen";
import { AppDrawer } from "./components/AppDrawer";
import { Button } from "./components/ui/button";
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
  Users
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



  const getContextData = () => {
    switch (activeContext) {
      case "work":
        return {
          title: "Work Context",
          icon: <Briefcase className="h-5 w-5 text-white" />,
          color: "bg-blue-500",
          currentContext: true,
          aiSuggestion: "Focus session starting in 10 minutes. Prepare your workspace.",
          nextAction: "Review quarterly goals presentation",
          timeRelevant: "Peak productivity hours",
          actions: [
            { label: "Start Deep Work Session", icon: <Clock className="h-4 w-4" />, urgent: true },
            { label: "Check Priority Inbox", icon: <Mail className="h-4 w-4" /> },
            { label: "Review Today's Meetings", icon: <Calendar className="h-4 w-4" /> },
            { label: "Update Project Status", icon: <CheckSquare className="h-4 w-4" /> }
          ]
        };
      case "personal":
        return {
          title: "Personal Context",
          icon: <Home className="h-5 w-5 text-white" />,
          color: "bg-green-500",
          aiSuggestion: "You have some personal tasks to catch up on.",
          nextAction: "Plan weekend activities",
          actions: [
            { label: "Personal Tasks", icon: <CheckSquare className="h-4 w-4" /> },
            { label: "Plan Weekend", icon: <Calendar className="h-4 w-4" /> },
            { label: "Photo Backup", icon: <Camera className="h-4 w-4" /> },
            { label: "Music Playlist", icon: <Music className="h-4 w-4" /> }
          ]
        };
      case "health":
        return {
          title: "Health & Fitness",
          icon: <Dumbbell className="h-5 w-5 text-white" />,
          color: "bg-orange-500",
          aiSuggestion: "Time for your afternoon water reminder.",
          nextAction: "Log today's meals",
          actions: [
            { label: "Track Workout", icon: <Dumbbell className="h-4 w-4" /> },
            { label: "Log Meals", icon: <CheckSquare className="h-4 w-4" /> },
            { label: "Water Reminder", icon: <Clock className="h-4 w-4" />, urgent: true },
            { label: "Health Stats", icon: <TrendingUp className="h-4 w-4" /> }
          ]
        };
      case "finance":
        return {
          title: "Finance Context",
          icon: <DollarSign className="h-5 w-5 text-white" />,
          color: "bg-yellow-500",
          aiSuggestion: "Budget review due tomorrow. You're 15% under target.",
          nextAction: "Review monthly expenses",
          actions: [
            { label: "Check Account Balance", icon: <TrendingUp className="h-4 w-4" /> },
            { label: "Pay Bills", icon: <CheckSquare className="h-4 w-4" />, urgent: true },
            { label: "Investment Review", icon: <Calendar className="h-4 w-4" /> },
            { label: "Budget Planning", icon: <Settings className="h-4 w-4" /> }
          ]
        };
      case "learning":
        return {
          title: "Learning Context",
          icon: <BookOpen className="h-5 w-5 text-white" />,
          color: "bg-indigo-500",
          aiSuggestion: "Continue your React course - 2 lessons remaining today.",
          nextAction: "Complete JavaScript fundamentals",
          actions: [
            { label: "Continue Course", icon: <BookOpen className="h-4 w-4" />, urgent: true },
            { label: "Practice Coding", icon: <Settings className="h-4 w-4" /> },
            { label: "Review Notes", icon: <CheckSquare className="h-4 w-4" /> },
            { label: "Join Study Group", icon: <UserCheck className="h-4 w-4" /> }
          ]
        };
      default:
        return null;
    }
  };

  const handleAppLaunch = (appName: string) => {
    console.log("Launching app:", appName);
    // Here you would integrate with your Android launcher to actually launch the app
  };

  const handleActionClick = (action: string) => {
    console.log("Action clicked:", action);
    // Handle specific actions like calling mom, starting focus session, etc.
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

  const currentContextData = getContextData();

  if (showAppDrawer) {
    return <AppDrawer onClose={() => setShowAppDrawer(false)} />;
  }

  return (
    <GestureDetector onTwoFingerSwipe={handleTwoFingerSwipe}>
      <div className="min-h-screen bg-background">
        {/* Main Content Area - Full Width */}
        <ContextScreen 
          contextId={activeContext}
          contextData={currentContextData}
          onAppLaunch={handleAppLaunch}
          onActionClick={handleActionClick}
        />

        {/* Circular Carousel - Overlay */}
        <CircularCarousel
          tabs={carouselTabs}
          activeTab={activeContext}
          onTabChange={handleTabChange}
          isOpen={showCarousel}
          onClose={handleCarouselClose}
        />

        {/* Floating App Drawer Button */}
        <div className="fixed bottom-6 right-6 z-20">
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