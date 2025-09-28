import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BellIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReminderSystemProps {
  isTimerRunning: boolean;
}

export const ReminderSystem = ({ isTimerRunning }: ReminderSystemProps) => {
  const [showReminder, setShowReminder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Set up 30-minute reminder if timer is not running
    if (!isTimerRunning) {
      interval = setInterval(() => {
        setShowReminder(true);
        toast({
          title: "Recordatorio de tiempo",
          description: "No olvides registrar el tiempo que estás trabajando",
          variant: "default"
        });
      }, 30 * 60 * 1000); // 30 minutes
    } else {
      setShowReminder(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, toast]);

  if (!showReminder || isTimerRunning) {
    return null;
  }

  return (
    <Alert className="mb-4 border-timer-warning bg-timer-warning/10">
      <BellIcon className="h-4 w-4 text-timer-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-timer-warning font-medium">
          Recordatorio: No olvides registrar el tiempo que estás trabajando
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReminder(false)}
          className="h-auto p-1 text-timer-warning hover:text-timer-warning/80"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};