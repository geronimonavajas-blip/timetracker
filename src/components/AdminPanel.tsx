import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, TrashIcon, SettingsIcon, UsersIcon, BriefcaseIcon } from "lucide-react";

interface AdminPanelProps {
  clientes: string[];
  tareas: string[];
  onAddCliente: (cliente: string) => void;
  onRemoveCliente: (cliente: string) => void;
  onAddTarea: (tarea: string) => void;
  onRemoveTarea: (tarea: string) => void;
}

export const AdminPanel = ({ 
  clientes, 
  tareas, 
  onAddCliente, 
  onRemoveCliente, 
  onAddTarea, 
  onRemoveTarea 
}: AdminPanelProps) => {
  const [newCliente, setNewCliente] = useState("");
  const [newTarea, setNewTarea] = useState("");

  const handleAddCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCliente.trim() && !clientes.includes(newCliente.trim())) {
      onAddCliente(newCliente.trim());
      setNewCliente("");
    }
  };

  const handleAddTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTarea.trim() && !tareas.includes(newTarea.trim())) {
      onAddTarea(newTarea.trim());
      setNewTarea("");
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Panel de Administración
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona clientes y tareas disponibles
        </p>
      </div>

      <div className="p-6">
        <Tabs defaultValue="clientes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clientes" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="tareas" className="flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4" />
              Tareas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="space-y-4">
            <div className="space-y-4">
              <form onSubmit={handleAddCliente} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newCliente" className="sr-only">Nuevo Cliente</Label>
                  <Input
                    id="newCliente"
                    value={newCliente}
                    onChange={(e) => setNewCliente(e.target.value)}
                    placeholder="Nombre del nuevo cliente..."
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="bg-timer-primary hover:bg-timer-primary/90">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-2">
                <Label>Clientes actuales ({clientes.length})</Label>
                <ScrollArea className="h-48 w-full border rounded-md p-3">
                  {clientes.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No hay clientes configurados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {clientes.map((cliente) => (
                        <div key={cliente} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <Badge variant="outline">{cliente}</Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onRemoveCliente(cliente)}
                            className="h-6 w-6 p-0"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tareas" className="space-y-4">
            <div className="space-y-4">
              <form onSubmit={handleAddTarea} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="newTarea" className="sr-only">Nueva Tarea</Label>
                  <Input
                    id="newTarea"
                    value={newTarea}
                    onChange={(e) => setNewTarea(e.target.value)}
                    placeholder="Nombre de la nueva tarea..."
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="bg-timer-primary hover:bg-timer-primary/90">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-2">
                <Label>Tareas actuales ({tareas.length})</Label>
                <ScrollArea className="h-48 w-full border rounded-md p-3">
                  {tareas.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No hay tareas configuradas
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tareas.map((tarea) => (
                        <div key={tarea} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <Badge variant="outline">{tarea}</Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onRemoveTarea(tarea)}
                            className="h-6 w-6 p-0"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};