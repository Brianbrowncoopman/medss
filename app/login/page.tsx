"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Esquema de validación con Zod
const authSchema = z.object({
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const { login, register: registerUser, loginWithGoogle } = useAuth();
  const router = useRouter();

  // Configuración de React Hook Form con Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormValues) => {
    setError("");
    try {
      if (isRegistering) {
        await registerUser(data.email, data.password);
      } else {
        await login(data.email, data.password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error en la autenticación");
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar con Google");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200/80 px-4 py-8">
      
      {/* Contenedor principal con glassmorphism y sombra elegante */}
      <div className="max-w-md w-full bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-orange-200">
        
        {/* Cabecera con Logotipo y Título */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3 p-2 bg-white rounded-2xl shadow-sm border border-orange-200 inline-block">
            <Logo className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Med<span className="text-orange-600">S</span> <span className="text-gray-700 font-medium text-lg">Esclerosis Múltiple</span>
          </h1>
          <p className="text-sm text-orange-800/80 font-medium mt-1">
            {isRegistering ? "Crea tu cuenta de paciente" : "Inicia sesión en tu espacio clínico"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium shadow-2xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-900 bg-white transition shadow-2xs"
              placeholder="tu@correo.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-900 bg-white transition shadow-2xs"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-xs text-red-600 font-medium mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-md hover:from-orange-700 hover:to-amber-700 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Procesando..." : isRegistering ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3 bg-white border border-orange-300 text-gray-700 font-semibold rounded-xl hover:bg-orange-50 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <span>Continuar con Google</span>
          </button>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-orange-200/60">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              reset();
            }}
            className="text-sm text-orange-700 font-semibold hover:text-orange-800 transition hover:underline cursor-pointer"
          >
            {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
          </button>
        </div>
      </div>
    </div>
  );
}