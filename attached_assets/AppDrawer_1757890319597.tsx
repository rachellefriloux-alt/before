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
    { id: "13", name: "Chrome", icon: <Globe className="h-6 w-6" />, category: "tools", recentlyUsed: true },
    { id: "14", name: "Amazon", icon: <ShoppingCart className="h-6 w-6" />, category: "shopping" },
    { id: "15", name: "Games", icon: <Gamepad2 className="h-6 w-6" />, category: "entertainment" },
    { id: "16", name: "Design", icon: <Brush className="h-6 w-6" />, category: "productivity", newInstall: true },
    { id: "17", name: "Podcast", icon: <Headphones className="h-6 w-6" />, category: "entertainment" },
    { id: "18", name: "Uber", icon: <Car className="h-6 w-6" />, category: "navigation" },
    { id: "19", name: "Flight", icon: <Plane className="h-6 w-6" />, category: "travel" },
    { id: "20", name: "Banking", icon: <Building className="h-6 w-6" />, category: "finance" },
    { id: "21", name: "Food", icon: <Utensils className="h-6 w-6" />, category: "lifestyle" },
    { id: "22", name: "Security", icon: <Shield className="h-6 w-6" />, category: "tools" },
    { id: "23", name: "Energy", icon: <Zap className="h-6 w-6" />, category: "tools", newInstall: true }
  ];

  const categories = [
    { id: "all", name: "All Apps", icon: <Smartphone className="h-4 w-4" /> },
    { id: "recent", name: "Recent", icon: <Clock className="h-4 w-4" /> },
    { id: "favorites", name: "Favorites", icon: <Star className="h-4 w-4" /> },
    { id: "communication", name: "Communication", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "productivity", name: "Productivity", icon: <FileText className="h-4 w-4" /> },
    { id: "entertainment", name: "Entertainment", icon: <Video className="h-4 w-4" /> },
    { id: "tools", name: "Tools", icon: <Settings className="h-4 w-4" /> },
    { id: "navigation", name: "Navigation", icon: <MapPin className="h-4 w-4" /> },
    { id: "media", name: "Media", icon: <Image className="h-4 w-4" /> },
    { id: "shopping", name: "Shopping", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "finance", name: "Finance", icon: <Building className="h-4 w-4" /> },
    { id: "travel", name: "Travel", icon: <Plane className="h-4 w-4" /> },
    { id: "lifestyle", name: "Lifestyle", icon: <Utensils className="h-4 w-4" /> },
    { id: "system", name: "System", icon: <Settings className="h-4 w-4" /> }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "recent") return matchesSearch && app.recentlyUsed;
    if (selectedCategory === "favorites") return matchesSearch && app.favorite;
    
    return matchesSearch && app.category === selectedCategory;
  });

  const AppIcon = ({ app }: { app: App }) => (
    <div className="relative">
      <Button
        variant="ghost"
        className={`${viewMode === 'grid' ? 'h-20 w-20 flex-col gap-2' : 'w-full justify-start gap-3 h-12'} p-2`}
      >
        <div className="relative">
          {app.icon}
          {app.newInstall && (
            <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-green-500">
              <Download className="h-2 w-2" />
            </Badge>
          )}
          {app.favorite && (
            <Star className="absolute -top-1 -left-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <span className={`${viewMode === 'grid' ? 'text-xs' : 'text-sm'} truncate`}>
          {app.name}
        </span>
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">All Apps</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
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

      {/* Categories */}
      <ScrollArea className="px-4 py-2">
        <div className="flex gap-2 pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              <span className="ml-1">{category.name}</span>
              {category.id === "recent" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {apps.filter(app => app.recentlyUsed).length}
                </Badge>
              )}
              {category.id === "favorites" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {apps.filter(app => app.favorite).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Apps Grid/List */}
      <ScrollArea className="flex-1 px-4">
        <div className="pb-6">
          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No apps found</p>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-4 gap-4" 
                : "space-y-1"
            }>
              {filteredApps.map(app => (
                <AppIcon key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}