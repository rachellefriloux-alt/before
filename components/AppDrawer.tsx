
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { 
  Search, 
  Grid3X3, 
  List, 
  Clock,
  Star,
  Download,
  Smartphone,
  Camera,
  MessageCircle,
  Mail,
  Music,
  Calculator,
  Settings,
  Calendar,
  MapPin,
  Phone,
  Image,
  FileText,
  Video,
  Globe,
  ShoppingCart,
  Gamepad2,
  Brush,
  Headphones,
  Car,
  Plane,
  Building,
  Utensils,
  Shield,
  Zap
} from "lucide-react";

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  recentlyUsed?: boolean;
  favorite?: boolean;
  newInstall?: boolean;
}

interface AppDrawerProps {
  onClose: () => void;
}

export function AppDrawer({ onClose }: AppDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock app data - in real implementation this would come from device
  const apps: App[] = [
    { id: "1", name: "Camera", icon: <Camera className="h-6 w-6" />, category: "tools", recentlyUsed: true },
    { id: "2", name: "Messages", icon: <MessageCircle className="h-6 w-6" />, category: "communication", favorite: true },
    { id: "3", name: "Gmail", icon: <Mail className="h-6 w-6" />, category: "communication", recentlyUsed: true },
    { id: "4", name: "Spotify", icon: <Music className="h-6 w-6" />, category: "entertainment", favorite: true },
    { id: "5", name: "Calculator", icon: <Calculator className="h-6 w-6" />, category: "tools" },
    { id: "6", name: "Settings", icon: <Settings className="h-6 w-6" />, category: "system" },
    { id: "7", name: "Calendar", icon: <Calendar className="h-6 w-6" />, category: "productivity", recentlyUsed: true },
    { id: "8", name: "Maps", icon: <MapPin className="h-6 w-6" />, category: "navigation" },
    { id: "9", name: "Phone", icon: <Phone className="h-6 w-6" />, category: "communication", favorite: true },
    { id: "10", name: "Gallery", icon: <Image className="h-6 w-6" />, category: "media" },
    { id: "11", name: "Notes", icon: <FileText className="h-6 w-6" />, category: "productivity" },
    { id: "12", name: "YouTube", icon: <Video className="h-6 w-6" />, category: "entertainment" },
    { id: "13", name: "Chrome", icon: <Globe className="h-6 w-6" />, category: "tools" },
    { id: "14", name: "Shopping", icon: <ShoppingCart className="h-6 w-6" />, category: "lifestyle" },
    { id: "15", name: "Games", icon: <Gamepad2 className="h-6 w-6" />, category: "games" },
    { id: "16", name: "Design", icon: <Brush className="h-6 w-6" />, category: "creativity", newInstall: true },
    { id: "17", name: "Podcast", icon: <Headphones className="h-6 w-6" />, category: "entertainment" },
    { id: "18", name: "Drive", icon: <Car className="h-6 w-6" />, category: "navigation" },
    { id: "19", name: "Travel", icon: <Plane className="h-6 w-6" />, category: "lifestyle" },
    { id: "20", name: "Banking", icon: <Building className="h-6 w-6" />, category: "finance" },
  ];

  const categories = [
    "all", "communication", "tools", "entertainment", "productivity", 
    "media", "navigation", "lifestyle", "games", "creativity", "finance", "system"
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recentApps = apps.filter(app => app.recentlyUsed);
  const favoriteApps = apps.filter(app => app.favorite);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-semibold">Apps</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        {/* Categories */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        {searchQuery === "" && selectedCategory === "all" && (
          <>
            {/* Recent Apps */}
            {recentApps.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Recent</h3>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {recentApps.slice(0, 6).map((app) => (
                    <Button
                      key={app.id}
                      variant="ghost"
                      className="h-16 w-full flex-col gap-1 p-2"
                      onClick={onClose}
                    >
                      {app.icon}
                      <span className="text-xs truncate w-full">{app.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Apps */}
            {favoriteApps.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Favorites</h3>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {favoriteApps.slice(0, 6).map((app) => (
                    <Button
                      key={app.id}
                      variant="ghost"
                      className="h-16 w-full flex-col gap-1 p-2"
                      onClick={onClose}
                    >
                      {app.icon}
                      <span className="text-xs truncate w-full">{app.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* All Apps */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">
            {selectedCategory === "all" ? "All Apps" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Apps`}
          </h3>
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="relative h-20 w-full flex-col gap-2 p-3"
                  onClick={onClose}
                >
                  {app.icon}
                  <span className="text-xs truncate w-full">{app.name}</span>
                  {app.newInstall && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                      <Download className="h-2 w-2" />
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="w-full justify-start h-12 px-3"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3 w-full">
                    {app.icon}
                    <span className="flex-1 text-left">{app.name}</span>
                    <div className="flex items-center gap-1">
                      {app.favorite && <Star className="h-3 w-3 text-yellow-500" />}
                      {app.recentlyUsed && <Clock className="h-3 w-3 text-blue-500" />}
                      {app.newInstall && <Download className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
