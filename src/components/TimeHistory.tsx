import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ClockIcon, CalendarIcon, UserIcon, BriefcaseIcon, EditIcon, DownloadIcon } from "lucide-react";
import { EditTimeEntryDialog } from "./EditTimeEntryDialog";
import * as XLSX from 'xlsx';

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

interface TimeHistoryProps {
  entries: TimeEntry[];
  onUpdateEntry: (updatedEntry: TimeEntry) => void;
  clientes: string[];
  tareas: string[];
  userName: string;
}

export const TimeHistory = ({ entries, onUpdateEntry, clientes, tareas, userName }: TimeHistoryProps) => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalTime = () => {
    return entries.reduce((total, entry) => total + entry.duracion, 0);
  };

  const getUniqueClients = () => {
    return [...new Set(entries.map(entry => entry.cliente))];
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveEntry = (updatedEntry: TimeEntry) => {
    onUpdateEntry(updatedEntry);
    setEditingEntry(null);
  };

  const exportToXLSX = () => {
    if (entries.length === 0) return;

    const exportData = entries.map(entry => ({
      'Usuario': entry.usuario || userName || 'Sin especificar',
      'Cliente': entry.cliente,
      'Tarea': entry.tarea,
      'Descripción': entry.descripcion || '',
      'Fecha Inicio': formatDateTime(entry.fechaInicio),
      'Fecha Fin': formatDateTime(entry.fechaFin),
      'Duración': formatDuration(entry.duracion),
      'Duración (Horas)': (entry.duracion / 3600).toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registro de Tiempo');
    
    const fileName = `registro-tiempo-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-card shadow-card">
        <div className="space-y-4">
          <ClockIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No hay registros</h3>
            <p className="text-muted-foreground">Comienza a registrar tu tiempo para ver el historial aquí</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Resumen de Registros</h2>
          <Button
            onClick={exportToXLSX}
            disabled={entries.length === 0}
            className="bg-timer-success hover:bg-timer-success/90 text-white"
            size="sm"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-timer-primary">{entries.length}</p>
            <p className="text-sm text-muted-foreground">Registros</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-timer-success">{formatDuration(getTotalTime())}</p>
            <p className="text-sm text-muted-foreground">Tiempo Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-timer-warning">{getUniqueClients().length}</p>
            <p className="text-sm text-muted-foreground">Clientes</p>
          </div>
        </div>
      </Card>

      {/* Lista de registros */}
      <Card className="bg-gradient-card shadow-card">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Historial de Tiempo
          </h3>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-timer-primary/20 text-timer-primary border-timer-primary/30">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {entry.cliente}
                      </Badge>
                      <Badge variant="outline">
                        <BriefcaseIcon className="h-3 w-3 mr-1" />
                        {entry.tarea}
                      </Badge>
                    </div>
                    
                    {entry.descripcion && (
                      <p className="text-sm text-muted-foreground">
                        {entry.descripcion}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDateTime(entry.fechaInicio)}
                      </span>
                      <span>→</span>
                      <span>{formatDateTime(entry.fechaFin)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-timer-success">
                        {formatDuration(entry.duracion)}
                      </div>
                      <Button
                        onClick={() => handleEditEntry(entry)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <EditIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {index < entries.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
      
      <EditTimeEntryDialog
        entry={editingEntry}
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEntry}
        clientes={clientes}
        tareas={tareas}
      />
    </div>
  );
};