import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Zap, TrendingUp, AlertCircle } from "lucide-react";

interface AISuggestion {
  type: 'productivity' | 'reminder' | 'optimization' | 'alert';
  message: string;
  action?: string;
}

interface AIAssistantBarProps {
  suggestions: AISuggestion[];
  currentFocus?: string;
  productivityScore?: number;
}

export function AIAssistantBar({ suggestions, currentFocus, productivityScore }: AIAssistantBarProps) {
  const getIconForType = (type: AISuggestion['type']) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-4 w-4" />;
      case 'reminder': return <AlertCircle className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getColorForType = (type: AISuggestion['type']) => {
    switch (type) {
      case 'productivity': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'optimization': return 'bg-purple-100 text-purple-800';
      case 'alert': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {currentFocus && (
            <Badge variant="outline" className="text-xs">
              Focus: {currentFocus}
            </Badge>
          )}
          {productivityScore && (
            <Badge variant={productivityScore >= 80 ? "default" : "secondary"} className="text-xs">
              {productivityScore}% Productive
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-background/50">
            <div className={`p-1 rounded ${getColorForType(suggestion.type)}`}>
              {getIconForType(suggestion.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{suggestion.message}</p>
              {suggestion.action && (
                <Button variant="link" className="h-auto p-0 text-xs text-primary">
                  {suggestion.action}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}