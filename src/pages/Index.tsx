import { useState, useEffect } from "react";
import { Timer } from "@/components/Timer";
import { TimeEntryForm } from "@/components/TimeEntryForm";
import { TimeHistory } from "@/components/TimeHistory";
import { AdminPanel } from "@/components/AdminPanel";
import { AuthPage } from "@/components/AuthPage";
import { ReminderSystem } from "@/components/ReminderSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClockIcon, HistoryIcon, SettingsIcon, LogOutIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

// Mock data inicial
const initialClientes = ["Empresa ABC", "Corporación XYZ", "Startup Tech", "Consultora 123", "Agencia Creativa"];
const initialTareas = ["Desarrollo Frontend", "Desarrollo Backend", "Diseño UI/UX", "Testing", "Documentación", "Reunión con cliente", "Planificación", "Investigación"];

const Index = () => {
  const { toast } = useToast();
  const { user, profile, loading, signOut } = useAuth();
  // Check admin status from profile data
  const isAdmin = profile?.is_admin === true || profile?.role === 'admin';
  
  console.log('Profile data:', profile);
  console.log('Is admin check:', isAdmin);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
  const [clientes, setClientes] = useState(initialClientes);
  const [tareas, setTareas] = useState(initialTareas);

  // Timer state - persisted across tab changes
  const [timerTime, setTimerTime] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);

  // Load time entries from Supabase
  useEffect(() => {
    if (user) {
      loadTimeEntries();
    }
  }, [user]);

  // Timer interval effect - runs in parent to persist across tab changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning]);

  const loadTimeEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading time entries:', error);
        return;
      }

      const formattedEntries: TimeEntry[] = data.map(entry => ({
        id: entry.id,
        cliente: entry.cliente,
        tarea: entry.tarea,
        descripcion: entry.descripcion || '',
        fechaInicio: new Date(entry.fecha_inicio),
        fechaFin: new Date(entry.fecha_fin),
        duracion: entry.duracion,
        usuario: profile?.username || user.email || 'Usuario'
      }));

      setEntries(formattedEntries);
    } catch (err) {
      console.error('Error loading time entries:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive"
      });
    }
  };
  const handleTimeComplete = (duration: number) => {
    setCurrentDuration(duration);
    setCurrentStartTime(new Date(Date.now() - duration * 1000));
    // Reset timer state after completing
    setTimerTime(0);
    setTimerIsRunning(false);
    setTimerStartTime(null);
  };

  const handleAutoSave = async (duration: number, startTime: Date) => {
    if (!user || !profile) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar logueado para guardar registros",
        variant: "destructive"
      });
      return;
    }

    setCurrentDuration(duration);
    setCurrentStartTime(startTime);

    // Show toast to indicate the time is ready to be saved
    toast({
      title: "Tiempo registrado",
      description: "Completa los datos para guardar el registro"
    });
  };

  const handleSaveEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    if (!user || !profile) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar logueado para guardar registros",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          cliente: entry.cliente,
          tarea: entry.tarea,
          descripcion: entry.descripcion,
          fecha_inicio: entry.fechaInicio.toISOString(),
          fecha_fin: entry.fechaFin.toISOString(),
          duracion: entry.duracion
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving time entry:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el registro",
          variant: "destructive"
        });
        return;
      }

      const newEntry: TimeEntry = {
        id: data.id,
        cliente: entry.cliente,
        tarea: entry.tarea,
        descripcion: entry.descripcion,
        fechaInicio: entry.fechaInicio,
        fechaFin: entry.fechaFin,
        duracion: entry.duracion,
        usuario: profile.username
      };

      setEntries(prev => [newEntry, ...prev]);
      setCurrentDuration(0);
      setCurrentStartTime(null);
      
      toast({
        title: "Registro guardado",
        description: `Se registraron ${Math.floor(entry.duracion / 3600)}h ${Math.floor(entry.duracion % 3600 / 60)}m para ${entry.cliente}`
      });
    } catch (err) {
      console.error('Error saving entry:', err);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEntry = async (updatedEntry: TimeEntry) => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar logueado para actualizar registros",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          cliente: updatedEntry.cliente,
          tarea: updatedEntry.tarea,
          descripcion: updatedEntry.descripcion,
          fecha_inicio: updatedEntry.fechaInicio.toISOString(),
          fecha_fin: updatedEntry.fechaFin.toISOString(),
          duracion: updatedEntry.duracion
        })
        .eq('id', updatedEntry.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating time entry:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el registro",
          variant: "destructive"
        });
        return;
      }

      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id 
          ? { ...updatedEntry, usuario: profile?.username || user.email || 'Usuario' }
          : entry
      ));

      toast({
        title: "Registro actualizado",
        description: `Se actualizó el registro para ${updatedEntry.cliente}`
      });
    } catch (err) {
      console.error('Error updating entry:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro",
        variant: "destructive"
      });
    }
  };
  const handleAddCliente = (cliente: string) => {
    setClientes(prev => [...prev, cliente]);
    toast({
      title: "Cliente agregado",
      description: `${cliente} se agregó a la lista`
    });
  };

  const handleRemoveCliente = (cliente: string) => {
    setClientes(prev => prev.filter(c => c !== cliente));
    toast({
      title: "Cliente eliminado",
      description: `${cliente} se eliminó de la lista`,
      variant: "destructive"
    });
  };

  const handleAddTarea = (tarea: string) => {
    setTareas(prev => [...prev, tarea]);
    toast({
      title: "Tarea agregada",
      description: `${tarea} se agregó a la lista`
    });
  };

  const handleRemoveTarea = (tarea: string) => {
    setTareas(prev => prev.filter(t => t !== tarea));
    toast({
      title: "Tarea eliminada",
      description: `${tarea} se eliminó de la lista`,
      variant: "destructive"
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente"
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ClockIcon className="h-12 w-12 mx-auto text-timer-primary animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ClockIcon className="h-8 w-8 text-timer-primary" />
            <h1 className="text-4xl font-bold">TimeTracker Pro (NUEVO)</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Registro profesional de tiempo y productividad
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">
              Bienvenido, {profile?.username || user.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>

        {/* Reminder System - only show if timer is not running */}
        <ReminderSystem isTimerRunning={timerIsRunning} />

        <Tabs defaultValue="timer" className="space-y-6">
          <TabsList className={`grid w-full max-w-md mx-auto ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Timer</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="timer" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Timer 
                onTimeComplete={handleTimeComplete} 
                onAutoSave={handleAutoSave} 
                time={timerTime} 
                setTime={setTimerTime} 
                isRunning={timerIsRunning} 
                setIsRunning={setTimerIsRunning} 
                startTime={timerStartTime} 
                setStartTime={setTimerStartTime} 
              />
              <TimeEntryForm 
                onSave={handleSaveEntry} 
                duration={currentDuration} 
                startTime={currentStartTime} 
                clientes={clientes} 
                tareas={tareas} 
              />
            </div>
          </TabsContent>

          <TabsContent value="history">
            <TimeHistory 
              entries={entries} 
              onUpdateEntry={handleUpdateEntry} 
              clientes={clientes} 
              tareas={tareas} 
              userName={profile?.username || user.email || 'Usuario'} 
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <div className="max-w-2xl mx-auto">
                <AdminPanel 
                  clientes={clientes} 
                  tareas={tareas} 
                  onAddCliente={handleAddCliente} 
                  onRemoveCliente={handleRemoveCliente} 
                  onAddTarea={handleAddTarea} 
                  onRemoveTarea={handleRemoveTarea} 
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};
export default Index;
