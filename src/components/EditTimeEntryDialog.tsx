import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIcon, XIcon } from "lucide-react";

interface TimeEntry {
  id: string;
  cliente: string;
  tarea: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracion: number;
  usuario?: string;
}

interface EditTimeEntryDialogProps {
  entry: TimeEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: TimeEntry) => void;
  clientes: string[];
  tareas: string[];
}

export const EditTimeEntryDialog = ({ 
  entry, 
  isOpen, 
  onClose, 
  onSave, 
  clientes, 
  tareas 
}: EditTimeEntryDialogProps) => {
  const [formData, setFormData] = useState({
    cliente: "",
    tarea: "",
    descripcion: "",
    duracion: 0,
    fechaInicio: "",
    fechaFin: ""
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        cliente: entry.cliente,
        tarea: entry.tarea,
        descripcion: entry.descripcion,
        duracion: entry.duracion,
        fechaInicio: entry.fechaInicio.toISOString().slice(0, 16),
        fechaFin: entry.fechaFin.toISOString().slice(0, 16)
      });
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry || !formData.cliente || !formData.tarea) return;
    
    const updatedEntry: TimeEntry = {
      ...entry,
      cliente: formData.cliente,
      tarea: formData.tarea,
      descripcion: formData.descripcion,
      duracion: formData.duracion,
      fechaInicio: new Date(formData.fechaInicio),
      fechaFin: new Date(formData.fechaFin)
    };
    
    onSave(updatedEntry);
    onClose();
  };

  const formatDurationToHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}.${(minutes / 60 * 100).toFixed(0).padStart(2, '0')}`;
  };

  const parseDurationFromHours = (value: string) => {
    const [hours, decimalMinutes] = value.split('.');
    const h = parseInt(hours) || 0;
    const m = decimalMinutes ? parseInt(decimalMinutes) * 0.6 : 0;
    return h * 3600 + m * 60;
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Editar Registro
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={formData.cliente} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente} value={cliente}>
                    {cliente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tarea">Tarea</Label>
            <Select value={formData.tarea} onValueChange={(value) => setFormData(prev => ({ ...prev, tarea: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una tarea" />
              </SelectTrigger>
              <SelectContent>
                {tareas.map((tarea) => (
                  <SelectItem key={tarea} value={tarea}>
                    {tarea}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción del trabajo..."
              className="min-h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Inicio</Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fin</Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={formData.fechaFin}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaFin: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duracion">Duración (horas)</Label>
            <Input
              id="duracion"
              type="number"
              step="0.01"
              value={formatDurationToHours(formData.duracion)}
              onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseDurationFromHours(e.target.value) }))}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-timer-success hover:bg-timer-success/90 text-white"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};