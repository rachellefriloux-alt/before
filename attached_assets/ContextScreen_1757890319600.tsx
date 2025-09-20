import { ScrollArea } from "./ui/scroll-area";
import { ContextSection } from "./ContextSection";
import { ProductivityWidget } from "./ProductivityWidget";
import { CategoryGrid } from "./CategoryGrid";
import { AIAssistantBar } from "./AIAssistantBar";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Phone, 
  MessageCircle, 
  Video, 
  Heart,
  Calendar,
  Clock,
  Mail,
  Camera,
  Music,
  Settings,
  TrendingUp,
  CheckSquare,
  MapPin,
  Users,
  Gift,
  Coffee,
  Utensils
} from "lucide-react";

interface ContextScreenProps {
  contextId: string;
  contextData: any;
  onAppLaunch: (appName: string) => void;
  onActionClick: (action: string) => void;
}

export function ContextScreen({ contextId, contextData, onAppLaunch, onActionClick }: ContextScreenProps) {
  
  const getMomScreenContent = () => (
    <div className="space-y-4">
      {/* AI Assistant for Mom Context */}
      <AIAssistantBar 
        suggestions={[
          {
            type: 'reminder' as const,
            message: 'Mom\'s birthday is next week. Time to plan something special!',
            action: 'Set Reminder'
          },
          {
            type: 'productivity' as const,
            message: 'Call mom - you haven\'t talked in 3 days.',
            action: 'Call Now'
          }
        ]}
        currentFocus="Family Time"
        productivityScore={92}
      />

      {/* Quick Actions for Mom */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Quick Actions for Mom
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => onActionClick('call-mom')}
          >
            <Phone className="h-5 w-5" />
            <span className="text-sm">Call Mom</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => onActionClick('video-call-mom')}
          >
            <Video className="h-5 w-5" />
            <span className="text-sm">Video Call</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => onActionClick('text-mom')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Send Message</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => onActionClick('plan-visit')}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Plan Visit</span>
          </Button>
        </div>
      </Card>

      {/* Recent Conversations */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Recent with Mom</h3>
        <div className="space-y-2">
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm">"Thanks for the recipe! Made it last night 🍝"</p>
            <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
          </div>
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-sm">"Can't wait to see you this weekend!"</p>
            <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
          </div>
        </div>
      </Card>

      {/* Family Events */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-500" />
          Upcoming Family Events
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Mom's Birthday</p>
              <p className="text-xs text-muted-foreground">March 15 - Next Week</p>
            </div>
            <Badge variant="secondary">7 days</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Family Dinner</p>
              <p className="text-xs text-muted-foreground">This Sunday</p>
            </div>
            <Badge variant="outline">3 days</Badge>
          </div>
        </div>
      </Card>
    </div>
  );

  const getSocialScreenContent = () => (
    <div className="space-y-4">
      {/* AI Assistant for Social Context */}
      <AIAssistantBar 
        suggestions={[
          {
            type: 'productivity' as const,
            message: 'Sarah tagged you in 3 photos. Maybe respond to show you care!',
            action: 'View Photos'
          },
          {
            type: 'reminder' as const,
            message: 'Group hangout planned for tonight at 7 PM.',
            action: 'Get Directions'
          }
        ]}
        currentFocus="Social Connection"
        productivityScore={78}
      />

      {/* Social Media Quick Access */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Social Apps
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "Instagram", icon: <Camera className="h-5 w-5" />, notifications: 5 },
            { name: "WhatsApp", icon: <MessageCircle className="h-5 w-5" />, notifications: 12 },
            { name: "Discord", icon: <Users className="h-5 w-5" />, notifications: 3 },
            { name: "Snapchat", icon: <Camera className="h-5 w-5" />, notifications: 8 }
          ].map((app) => (
            <Button
              key={app.name}
              variant="outline"
              className="relative h-16 flex-col gap-1"
              onClick={() => onAppLaunch(app.name)}
            >
              {app.icon}
              <span className="text-xs">{app.name}</span>
              {app.notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                >
                  {app.notifications}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Recent Social Activity */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">S</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">Sarah liked your photo</p>
              <p className="text-xs text-muted-foreground">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">M</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">Mike commented on your post</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">J</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">Jessica shared a story</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Upcoming Social Events */}
      <Card className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Coffee className="h-5 w-5 text-brown-500" />
          Social Plans
        </h3>
        <div className="space-y-2">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Coffee with Emma</p>
              <Badge variant="outline">Today 3 PM</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Starbucks downtown</p>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">Group Dinner</p>
              <Badge variant="secondary">Tonight 7 PM</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Italian place on 5th St</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const getPersonalScreenContent = () => (
    <div className="space-y-4">
      {contextData && <ContextSection {...contextData} />}
      
      <ProductivityWidget 
        dailyGoals={[
          { name: "Reading", progress: 25, target: 30, unit: "minutes" },
          { name: "Meditation", progress: 1, target: 1, unit: "session" },
          { name: "Steps", progress: 7500, target: 10000, unit: "steps" },
          { name: "Sleep", progress: 7, target: 8, unit: "hours" }
        ]}
        focusTimeRemaining={45}
        streakDays={12}
        nextBreak="4:00 PM"
      />

      <CategoryGrid 
        categories={[
          {
            title: "Lifestyle",
            icon: <Utensils className="h-5 w-5 text-white" />,
            color: "bg-green-500",
            apps: [
              { name: "Recipes", icon: <Utensils className="h-5 w-5" /> },
              { name: "Fitness", icon: <TrendingUp className="h-5 w-5" /> },
              { name: "Meditation", icon: <Heart className="h-5 w-5" /> },
              { name: "Journal", icon: <CheckSquare className="h-5 w-5" /> }
            ]
          }
        ]}
        onCategoryClick={() => {}}
        onAppClick={onAppLaunch}
      />
    </div>
  );

  const getWorkScreenContent = () => (
    <div className="space-y-4">
      {contextData && <ContextSection {...contextData} />}
      
      <ProductivityWidget 
        dailyGoals={[
          { name: "Deep Work", progress: 2, target: 4, unit: "hours" },
          { name: "Meetings", progress: 3, target: 5, unit: "calls" },
          { name: "Tasks Done", progress: 8, target: 12, unit: "items" },
          { name: "Focus Time", progress: 90, target: 120, unit: "minutes" }
        ]}
        focusTimeRemaining={118}
        streakDays={7}
        nextBreak="3:30 PM"
      />

      <CategoryGrid 
        categories={[
          {
            title: "Work Tools",
            icon: <Settings className="h-5 w-5 text-white" />,
            color: "bg-blue-500",
            totalNotifications: 5,
            apps: [
              { name: "Slack", icon: <MessageCircle className="h-5 w-5" />, newNotifications: 3 },
              { name: "Email", icon: <Mail className="h-5 w-5" />, newNotifications: 2 },
              { name: "Calendar", icon: <Calendar className="h-5 w-5" />, urgent: true },
              { name: "Tasks", icon: <CheckSquare className="h-5 w-5" /> }
            ]
          }
        ]}
        onCategoryClick={() => {}}
        onAppClick={onAppLaunch}
      />
    </div>
  );

  const renderScreenContent = () => {
    switch (contextId) {
      case "mom":
        return getMomScreenContent();
      case "social":
        return getSocialScreenContent();
      case "personal":
        return getPersonalScreenContent();
      case "work":
        return getWorkScreenContent();
      default:
        return contextData ? <ContextSection {...contextData} /> : null;
    }
  };

  return (
    <div className="flex-1 min-h-screen">
      <ScrollArea className="h-screen">
        <div className="p-4 pb-24 space-y-4">
          {renderScreenContent()}
        </div>
      </ScrollArea>
    </div>
  );
}