import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClockIcon, PlusIcon } from "lucide-react";

interface ManualTimeInputProps {
  onTimeSet: (seconds: number) => void;
}

export const ManualTimeInput = ({ onTimeSet }: ManualTimeInputProps) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    
    if (h === 0 && m === 0 && s === 0) return;
    
    const totalSeconds = h * 3600 + m * 60 + s;
    onTimeSet(totalSeconds);
    
    // Reset form
    setHours("");
    setMinutes("");
    setSeconds("");
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center pb-2">
          <Label className="flex items-center justify-center gap-2 text-sm font-medium">
            <ClockIcon className="h-4 w-4 text-timer-primary" />
            Agregar Tiempo Manual
          </Label>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="hours" className="text-xs text-muted-foreground">Horas</Label>
            <Input
              id="hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              min="0"
              max="23"
              className="text-center"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="minutes" className="text-xs text-muted-foreground">Min</Label>
            <Input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="seconds" className="text-xs text-muted-foreground">Seg</Label>
            <Input
              id="seconds"
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              placeholder="0"
              min="0"
              max="59"
              className="text-center"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-timer-primary hover:bg-timer-primary/90 text-white"
          size="sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Agregar Tiempo
        </Button>
      </form>
    </Card>
  );
};