import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface Context {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  notifications?: number;
  timeRelevant?: boolean;
}

interface QuickContextSwitcherProps {
  contexts: Context[];
  onContextSwitch: (contextId: string) => void;
}

export function QuickContextSwitcher({ contexts, onContextSwitch }: QuickContextSwitcherProps) {
  return (
    <div className="py-2">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-4 pb-2">
          {contexts.map((context) => (
            <Button
              key={context.id}
              variant={context.active ? "default" : "outline"}
              className="relative shrink-0 h-auto py-2 px-3"
              onClick={() => onContextSwitch(context.id)}
            >
              <div className="flex items-center gap-2">
                {context.icon}
                <span className="text-sm">{context.name}</span>
                {context.timeRelevant && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              {context.notifications && context.notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {context.notifications > 9 ? '9+' : context.notifications}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}