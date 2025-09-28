import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { ManualTimeInput } from "./ManualTimeInput";

interface TimerProps {
  onTimeComplete?: (elapsed: number) => void;
  onAutoSave?: (elapsed: number, startTime: Date) => void;
  time: number;
  setTime: (time: number | ((prevTime: number) => number)) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
}

export const Timer = ({ 
  onTimeComplete, 
  onAutoSave,
  time, 
  setTime, 
  isRunning, 
  setIsRunning, 
  startTime, 
  setStartTime 
}: TimerProps) => {

  // Timer interval is now handled in the parent component

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (time > 0 && startTime) {
      if (onAutoSave) {
        onAutoSave(time, startTime);
      } else if (onTimeComplete) {
        onTimeComplete(time);
      }
    }
    setTime(0);
    setStartTime(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
  };

  const handleManualTimeSet = (seconds: number) => {
    setTime(prevTime => prevTime + seconds);
    if (!startTime) {
      setStartTime(new Date(Date.now() - seconds * 1000));
    }
  };

  const getTimerStatus = () => {
    if (!isRunning && time === 0) return "idle";
    if (isRunning) return "running";
    return "paused";
  };

  const status = getTimerStatus();

  return (
    <div className="space-y-4">
      <Card className="p-8 bg-gradient-card shadow-timer border-border/50">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Badge variant={status === "running" ? "default" : status === "paused" ? "secondary" : "outline"} className="text-sm">
              {status === "running" ? "En progreso" : status === "paused" ? "Pausado" : "Inactivo"}
            </Badge>
            {startTime && (
              <p className="text-sm text-muted-foreground">
                Iniciado: {startTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="relative">
            <div className={`text-6xl font-mono font-bold transition-all duration-300 ${
              status === "running" 
                ? "text-transparent bg-gradient-primary bg-clip-text animate-pulse" 
                : "text-foreground"
            }`}>
              {formatTime(time)}
            </div>
            {status === "running" && (
              <div className="absolute inset-0 rounded-lg bg-timer-primary/10 blur-xl animate-pulse" />
            )}
          </div>

          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button 
                onClick={handleStart} 
                size="lg" 
                className="bg-timer-primary hover:bg-timer-primary/90 text-white shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {time > 0 ? "Continuar" : "Iniciar"}
              </Button>
            ) : (
              <Button 
                onClick={handlePause} 
                size="lg" 
                variant="secondary"
                className="shadow-lg"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </Button>
            )}
            
            <Button 
              onClick={handleStop} 
              size="lg" 
              className="bg-timer-success hover:bg-timer-success/90 text-white shadow-lg"
              disabled={time === 0}
            >
              <Square className="h-5 w-5 mr-2" />
              Finalizar
            </Button>
            
            <Button 
              onClick={handleReset} 
              size="lg" 
              variant="outline"
              disabled={time === 0}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>
      </Card>
      
      <ManualTimeInput onTimeSet={handleManualTimeSet} />
    </div>
  );
};