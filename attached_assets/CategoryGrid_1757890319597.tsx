import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronRight } from "lucide-react";

interface CategoryApp {
  name: string;
  icon: React.ReactNode;
  urgent?: boolean;
  newNotifications?: number;
}

interface Category {
  title: string;
  icon: React.ReactNode;
  color: string;
  apps: CategoryApp[];
  totalNotifications?: number;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryTitle: string) => void;
  onAppClick: (appName: string) => void;
}

export function CategoryGrid({ categories, onCategoryClick, onAppClick }: CategoryGridProps) {
  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onCategoryClick(category.title)}
            >
              <div className={`p-2 rounded-lg ${category.color}`}>
                {category.icon}
              </div>
              <div>
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {category.apps.length} apps
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {category.totalNotifications && category.totalNotifications > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {category.totalNotifications}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {category.apps.slice(0, 8).map((app, appIndex) => (
              <Button
                key={appIndex}
                variant="ghost"
                className="relative h-16 w-full flex-col gap-1 p-2"
                onClick={() => onAppClick(app.name)}
              >
                <div className="relative">
                  {app.icon}
                  {app.newNotifications && app.newNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {app.newNotifications > 9 ? '9+' : app.newNotifications}
                    </Badge>
                  )}
                  {app.urgent && (
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-xs truncate w-full">{app.name}</span>
              </Button>
            ))}
          </div>

          {category.apps.length > 8 && (
            <Button
              variant="outline"
              className="w-full mt-3 text-sm"
              onClick={() => onCategoryClick(category.title)}
            >
              View all {category.apps.length} apps
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}