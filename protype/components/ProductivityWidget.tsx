import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Target, Timer, Award, Calendar } from "lucide-react";

interface Goal {
  name: string;
  progress: number;
  target: number;
  unit: string;
}

interface ProductivityWidgetProps {
  dailyGoals: Goal[];
  focusTimeRemaining?: number;
  streakDays?: number;
  nextBreak?: string;
}

export function ProductivityWidget({ 
  dailyGoals, 
  focusTimeRemaining, 
  streakDays, 
  nextBreak 
}: ProductivityWidgetProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="font-medium">Today's Progress</h3>
      </div>

      <div className="space-y-3">
        {dailyGoals.map((goal, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{goal.name}</span>
              <span className="text-muted-foreground">
                {goal.progress}/{goal.target} {goal.unit}
              </span>
            </div>
            <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          {focusTimeRemaining && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Timer className="h-3 w-3" />
                Focus Time
              </div>
              <p className="text-sm font-medium">{focusTimeRemaining}m left</p>
            </div>
          )}

          {streakDays && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Award className="h-3 w-3" />
                Streak
              </div>
              <p className="text-sm font-medium">{streakDays} days</p>
            </div>
          )}
        </div>

        {nextBreak && (
          <Button variant="outline" className="w-full text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Break at {nextBreak}
          </Button>
        )}
      </div>
    </Card>
  );
}