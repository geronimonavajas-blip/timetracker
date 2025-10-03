import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, RotateCcwIcon, FlagIcon } from "lucide-react";

type TimerProps = {
  // estado controlado por el padre (Index.tsx)
  time: number;
  setTime: (n: number) => void;
  isRunning: boolean;
  setIsRunning: (b: boolean) => void;
  startTime: Date | null;
  setStartTime: (d: Date | null) => void;

  // callbacks del padre
  onTimeComplete: (duration: number) => void;   // cuando tocan Finalizar
  onAutoSave?: (duration: number, startTime: Date) => void; // si lo usás
};

export function Timer({
  time,
  setTime,
  isRunning,
  setIsRunning,
  startTime,
  setStartTime,
  onTimeComplete,
  onAutoSave,
}: TimerProps) {
  // inputs para agregar tiempo manual
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [s, setS] = useState(0);

  const format = (t: number) => {
    const hh = Math.floor(t / 3600);
    const mm = Math.floor((t % 3600) / 60);
    const ss = Math.floor(t % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  };

  const handleStart = () => {
    if (isRunning) return;
    // si ya tengo tiempo acumulado, retrocedo el start para que siga desde ahí
    const base = startTime ?? new Date(Date.now() - time * 1000);
    setStartTime(base);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleFinalize = () => {
    // NO se resetea; solo se pausa y se entrega el tiempo al padre
    setIsRunning(false);
    onTimeComplete(time);
    // Si querés un autosave apenas finaliza y ya hay cliente/tarea cargados,
    // podrías disparar onAutoSave?.(time, startTime ?? new Date());
  };

  const handleRestart = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
  };

  const handleAddManual = () => {
    const add = Math.max(0, h) * 3600 + Math.max(0, m) * 60 + Math.max(0, s);
    if (add <= 0) return;
    const nextTime = time + add;
    setTime(nextTime);

    // si está corriendo, recalibrar inicio para que el conteo siga coherente
    if (isRunning) {
      setStartTime(new Date(Date.now() - nextTime * 1000));
    }

    // limpiar inputs
    setH(0); setM(0); setS(0);
  };

  return (
    <div className="p-4 rounded-xl border bg-card text-card-foreground">
      <div className="text-center mb-4">
        <div className="text-sm opacity-60 mb-2">
          {isRunning ? "Activo" : "Inactivo"}
        </div>
        <div className="text-5xl font-mono tabular-nums tracking-wider">
          {format(time)}
        </div>
      </div>

      <div className="flex gap-2 justify-center mb-6">
        <Button onClick={handleStart}>
          <PlayIcon className="mr-2 h-4 w-4" /> Iniciar
        </Button>
        <Button variant="secondary" onClick={handlePause}>
          <PauseIcon className="mr-2 h-4 w-4" /> Pausa
        </Button>
        <Button variant="destructive" onClick={handleFinalize}>
          <FlagIcon className="mr-2 h-4 w-4" /> Finalizar
        </Button>
        <Button variant="outline" onClick={handleRestart}>
          <RotateCcwIcon className="mr-2 h-4 w-4" /> Reiniciar
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium mb-3">Agregar Tiempo Manual</div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            type="number"
            className="w-full rounded-md border bg-background p-2"
            value={h}
            onChange={(e) => setH(parseInt(e.target.value || "0", 10))}
            min={0}
            placeholder="Horas"
          />
          <input
            type="number"
            className="w-full rounded-md border bg-background p-2"
            value={m}
            onChange={(e) => setM(parseInt(e.target.value || "0", 10))}
            min={0}
            placeholder="Min"
          />
          <input
            type="number"
            className="w-full rounded-md border bg-background p-2"
            value={s}
            onChange={(e) => setS(parseInt(e.target.value || "0", 10))}
            min={0}
            placeholder="Seg"
          />
        </div>
        <Button className="w-full" onClick={handleAddManual}>
          + Agregar Tiempo
        </Button>
      </div>
    </div>
  );
}
