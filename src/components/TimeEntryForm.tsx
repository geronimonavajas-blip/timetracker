import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIcon, UserIcon, BriefcaseIcon, FileTextIcon } from "lucide-react";

interface TimeEntry {
  id?: string;
  cliente: string;
  tarea: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number;
}

interface TimeEntryFormProps {
  onSave: (entry: Omit<TimeEntry, 'id'>) => void;
  duration?: number;
  startTime?: Date;
  clientes?: string[];
  tareas?: string[];
}

// Mock data - en producción viene de Supabase
const mockClientes = [
  "Empresa ABC",
  "Corporación XYZ", 
  "Startup Tech",
  "Consultora 123",
  "Agencia Creativa"
];

const mockTareas = [
  "Desarrollo Frontend",
  "Desarrollo Backend",
  "Diseño UI/UX",
  "Testing",
  "Documentación",
  "Reunión con cliente",
  "Planificación",
  "Investigación"
];

export const TimeEntryForm = ({ onSave, duration = 0, startTime, clientes = mockClientes, tareas = mockTareas }: TimeEntryFormProps) => {
  const [cliente, setCliente] = useState("");
  const [tarea, setTarea] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cliente || !tarea) {
      alert("Por favor selecciona cliente y tarea");
      return;
    }

    const now = new Date();
    const entry: Omit<TimeEntry, 'id'> = {
      cliente,
      tarea,
      descripcion,
      fechaInicio: startTime || new Date(now.getTime() - duration * 1000),
      fechaFin: now,
      duracion: duration
    };

    onSave(entry);
    
    // Reset form
    setCliente("");
    setTarea("");
    setDescripcion("");
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center pb-4 border-b border-border/50">
          <h2 className="text-xl font-semibold">Registrar Tiempo</h2>
          {duration > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Duración: {formatDuration(duration)}
            </p>
          )}
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="cliente" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Cliente
            </Label>
            <Select value={cliente} onValueChange={setCliente} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {clientes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tarea" className="flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4" />
              Tarea
            </Label>
            <Select value={tarea} onValueChange={setTarea} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una tarea" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {tareas.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Descripción (opcional)
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el trabajo realizado..."
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-timer-success hover:bg-timer-success/90 text-white"
          size="lg"
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Guardar Registro
        </Button>
      </form>
    </Card>
  );
};