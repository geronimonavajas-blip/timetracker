import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { ClockIcon, KeyIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email y contraseña son requeridos");
      return false;
    }

    if (!isLogin) {
      if (!formData.username) {
        setError("El nombre de usuario es requerido");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e?: React.FormEvent, isAdminLogin = false) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Credenciales inválidas");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user && isAdminLogin) {
        const displayUsername =
          (data.user.user_metadata as any)?.username ||
          data.user.email?.split('@')[0] ||
          'admin';

        // Ensure profile exists and grant admin rights
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id, // keep id aligned with auth.uid()
              user_id: data.user.id,
              username: displayUsername,
              role: 'admin',
              is_admin: true,
            },
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.error('Error granting admin role:', upsertError);
        }
      }

      if (data.user) {
        toast({
          title: "Login exitoso",
          description: isAdminLogin ? "Bienvenido Administrador" : "Bienvenido al sistema",
        });
        onAuthSuccess();
      }
    } catch (err) {
      setError("Error inesperado al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (adminKey !== "Admin01") {
      setError("Clave de administrador incorrecta");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: formData.username
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("El usuario ya está registrado");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Crear perfil de usuario
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            user_id: data.user.id,
            username: formData.username,
            role: 'user',
            is_admin: false,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        toast({
          title: "Usuario registrado",
          description: "El usuario ha sido creado exitosamente",
        });
        
        setIsLogin(true);
        setFormData({ email: "", password: "", username: "", confirmPassword: "" });
        setAdminKey("");
      }
    } catch (err) {
      setError("Error inesperado al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card bg-gradient-card">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <ClockIcon className="h-8 w-8 text-timer-primary" />
            <CardTitle className="text-2xl">TimeTracker Pro</CardTitle>
          </div>
          <CardDescription>
            {isLogin ? "Inicia sesión en tu cuenta" : "Registro de nuevo usuario"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="adminKey" className="flex items-center gap-2">
                  <KeyIcon className="h-4 w-4" />
                  Clave de Administrador
                </Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Ingresa la clave de administrador"
                  required={!isLogin}
                />
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Nombre de Usuario
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nombre de usuario"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Tu contraseña"
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirma tu contraseña"
                  required={!isLogin}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-timer-primary hover:bg-timer-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrar Usuario")}
            </Button>
          </form>

          {isLogin && (
            <Button
              onClick={() => handleLogin(undefined, true)}
              className="w-full bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
              variant="destructive"
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              {isLoading ? "Procesando..." : "Acceso Administrador"}
            </Button>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ email: "", password: "", username: "", confirmPassword: "" });
                setAdminKey("");
              }}
              className="text-sm"
            >
              {isLogin ? "¿Registrar nuevo usuario?" : "¿Ya tienes cuenta?"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};