import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronRight, Clock, MapPin } from "lucide-react";

interface ContextAction {
  label: string;
  icon: React.ReactNode;
  urgent?: boolean;
}

interface ContextSectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  actions: ContextAction[];
  currentContext?: boolean;
  aiSuggestion?: string;
  nextAction?: string;
  timeRelevant?: string;
}

export function ContextSection({ 
  title, 
  icon, 
  color, 
  actions, 
  currentContext, 
  aiSuggestion,
  nextAction,
  timeRelevant 
}: ContextSectionProps) {
  return (
    <Card className={`p-4 transition-all duration-200 ${currentContext ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            {timeRelevant && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeRelevant}
              </div>
            )}
          </div>
        </div>
        {currentContext && (
          <Badge variant="secondary" className="text-xs">
            Active
          </Badge>
        )}
      </div>

      {aiSuggestion && (
        <div className="mb-3 p-2 bg-accent rounded-lg border-l-2 border-primary">
          <p className="text-sm text-accent-foreground">
            <span className="font-medium">AI:</span> {aiSuggestion}
          </p>
        </div>
      )}

      {nextAction && (
        <div className="mb-3 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3" />
            Next Action
          </div>
          <p className="text-sm">{nextAction}</p>
        </div>
      )}

      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.urgent ? "default" : "ghost"}
            className="w-full justify-between h-auto p-3"
          >
            <div className="flex items-center gap-2">
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </Card>
  );
}