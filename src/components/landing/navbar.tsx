"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Zap, LogOut, History, Bell, Compass, User, Briefcase, UserPlus, Sun, Moon } from "lucide-react";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { supabaseAuth, onAuthStateChange, type AuthUser } from "@/lib/supabase-auth";
import { NavbarWalkingAvatar } from "./navbar-walking-avatar";
import { useTheme } from "@/context/theme-context";

interface Session {
  id: string;
  nombre?: string;
  email?: string;
  tipo?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginTipo, setLoginTipo] = useState<"usuario" | "prestador">("usuario");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerTipo, setRegisterTipo] = useState<"usuario" | "prestador">("usuario");
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const s = JSON.parse(localStorage.getItem("altoke_session") || "null");
      if (s && s.id) return { id: s.id, nombre: s.nombre, email: s.email, tipo: s.tipo || "usuario" };
    } catch { /* noop */ }
    return null;
  });
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // Consulta inmediata de sesión en Supabase para sincronización rápida
    supabaseAuth.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        const u = data.session.user;
        const meta = (u.user_metadata || {}) as Record<string, unknown>;
        let sesionActual: { id?: string; tipo?: string } = {};
        try {
          sesionActual = JSON.parse(localStorage.getItem("altoke_session") || "{}");
        } catch { /* noop */ }

        const tipoActivo =
          sesionActual.id === u.id && sesionActual.tipo
            ? sesionActual.tipo
            : (meta.tipo as string) || "usuario";

        setSession({
          id: u.id,
          nombre: (meta.nombre as string) || "",
          email: u.email,
          tipo: tipoActivo,
        });
      }
    });

    const { data: { subscription } } = onAuthStateChange((user: AuthUser | null) => {
      if (user) {
        // El rol activo (usuario/prestador) lo elige el usuario al iniciar
        // sesión y queda en localStorage. La metadata solo refleja el primer
        // registro, así que se usa solo como respaldo.
        let sesionActual: { id?: string; tipo?: string; foto?: string } = {};
        try {
          sesionActual = JSON.parse(localStorage.getItem("altoke_session") || "{}");
        } catch { /* noop */ }

        const isPrestadorPath = typeof window !== "undefined" && window.location.pathname === "/prestador";
        const tipoActivo =
          isPrestadorPath
            ? "prestador"
            : sesionActual.id === user.id && sesionActual.tipo
            ? sesionActual.tipo
            : user.user_metadata?.tipo || "usuario";

        setSession({
          id: user.id,
          nombre: user.user_metadata?.nombre,
          email: user.email,
          tipo: tipoActivo,
        });
        // Sincronizar sesión legacy para páginas que usan localStorage
        const meta = user.user_metadata || {};
        const fotoLocal = sesionActual.foto || "";
        localStorage.setItem("altoke_session", JSON.stringify({
          id: user.id,
          email: user.email,
          tipo: tipoActivo,
          nombre: meta.nombre || "",
          rut: meta.rut || "",
          telefono: meta.telefono || "",
          fechaNacimiento: meta.fechaNacimiento || "",
          region: meta.region || "",
          comuna: meta.comuna || "",
          ciudadSector: meta.ciudadSector || "",
          servicios: meta.servicios || "",
          valorHora: meta.valorHora || "",
          foto: fotoLocal || meta.foto || "",
          fechaRegistro: user.created_at || new Date().toISOString(),
        }));
      } else {
        setSession(null);
        localStorage.removeItem("altoke_session");
      }
    });

    const updateAlerts = () => {
      try {
        const alerts = JSON.parse(localStorage.getItem("altoke_alerts") || "[]");
        setAlertCount(alerts.length);
      } catch {
        setAlertCount(0);
      }
    };

    updateAlerts();
    const handleStorage = () => {
      updateAlerts();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const router = useRouter();

  // onAuthStateChange puede leer el tipo de localStorage antes de que el
  // login escriba el rol elegido. Al cambiar de ruta (el login navega justo
  // después de escribir el tipo) se re-sincroniza el rol activo.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const s = JSON.parse(localStorage.getItem("altoke_session") || "{}");
        const targetTipo = pathname === "/prestador" ? "prestador" : s.tipo || session.tipo;
        if (targetTipo && targetTipo !== session.tipo) {
          setSession((prev) => (prev ? { ...prev, tipo: targetTipo } : prev));
          if (s.id === session.id) {
            localStorage.setItem("altoke_session", JSON.stringify({ ...s, tipo: targetTipo }));
          }
        }
      } catch { /* noop */ }
    });
    return () => { cancelled = true; };
  }, [pathname, session]);

  const handleLogout = async () => {
    await supabaseAuth.auth.signOut();
    setSession(null);
    setMobileOpen(false);
    router.push("/");
  };

  const handleLoginSuccess = () => {
    // Session will be updated via onAuthStateChange
  };

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors ${
          !isDark
            ? "border-[#F0ECE4] bg-[#FFFFFF]/92 shadow-sm"
            : "border-[#1E293B]/70 bg-[#06080F]/90 shadow-md shadow-black/20"
        }`}
      >
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md ${
                  !isDark
                    ? "bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] shadow-[#FF5A36]/25"
                    : "bg-gradient-to-br from-[#FF5A36] to-[#FF7A59] shadow-[#FF5A36]/20"
                }`}
              >
                <Zap size={18} fill="currentColor" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight ${
                  !isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"
                }`}
              >
                AlToke<span className="text-[#FF5A36]">Chile</span>
              </span>
            </Link>

            {/* Botón visible para poner la página oscura y volver al estado original */}
            <button
              onClick={toggleTheme}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm border cursor-pointer ${
                !isDark
                  ? "border-[#1E2022] bg-[#1E2022] hover:bg-black text-white"
                  : "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300"
              }`}
              title={theme === "dark" ? "Volver al estado original (claro)" : "Poner página en modo oscuro"}
              aria-label="Cambiar a modo oscuro o estado original"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} className="text-amber-400 shrink-0" />
                  <span>Modo original</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-amber-300 shrink-0" />
                  <span>Modo oscuro</span>
                </>
              )}
            </button>
          </div>

          {/* Avatar animado que recorre la barra superior realizando diversos trabajos */}
          <div className="hidden sm:flex flex-1 items-center px-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto h-16 pointer-events-auto relative">
            <NavbarWalkingAvatar />
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {session ? (
              <div className="flex items-center gap-5 ml-4">
                {pathname === "/prestador" || session.tipo === "prestador" ? (
                  <>
                    <Link
                      href="/prestador"
                      className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-xs font-bold text-white shadow-sm">
                        {session.nombre?.charAt(0) || "P"}
                      </div>
                      <span className={`text-sm font-semibold ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                        <span className={`${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"} font-normal`}>Bienvenido(a) </span>
                        {session.nombre || session.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        !isDark
                          ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#64748B] hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                          : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                      }`}
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/explorar"
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        !isDark
                          ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC] hover:border-[#FF5A36]/40"
                          : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                      }`}
                    >
                      <Compass size={15} />
                      Explorar
                    </Link>
                    <Link
                      href="/explorar?tab=alertas"
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all relative ${
                        !isDark
                          ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC] hover:border-[#FF5A36]/40"
                          : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                      }`}
                    >
                      <Bell size={15} />
                      Alertas
                      {alertCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A36] text-[10px] font-bold text-white">
                          {alertCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/explorar?tab=historial"
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        !isDark
                          ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC] hover:border-[#FF5A36]/40"
                          : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                      }`}
                    >
                      <History size={15} />
                      Historial
                    </Link>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A36] to-[#FF8A65] text-xs font-bold text-white shadow-xs">
                        {session.nombre?.charAt(0) || "U"}
                      </div>
                      <span className={`text-sm ${!isDark ? "text-[#1E2022]" : "text-[#94A3B8] hover:text-[#F1F5F9]"} transition-colors`}>
                        {session.nombre || session.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        !isDark
                          ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#64748B] hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                          : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                      }`}
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </>
                )}
                </div>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() => { setLoginTipo("usuario"); setRegisterTipo("usuario"); setLoginOpen(true); }}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#FF4820] hover:to-[#FF6845] shadow-md shadow-[#FF5A36]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Action Area */}
          <div className="flex items-center gap-2 md:hidden">
            {session ? (
              <Link
                href={session.tipo === "prestador" ? "/prestador" : "/explorar"}
                className={`flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-xs font-semibold active:scale-95 transition-all ${
                  !isDark
                    ? "border border-[#FF5A36]/30 bg-[#FF5A36]/10 text-[#1E2022]"
                    : "border border-[#FF5A36]/40 bg-[#FF5A36]/15 text-[#F1F5F9]"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ${
                    session.tipo === "prestador"
                      ? "bg-gradient-to-br from-[#FF5A36] to-[#FF8A65]"
                      : "bg-emerald-600"
                  }`}
                >
                  {session.nombre?.charAt(0).toUpperCase() || (session.tipo === "prestador" ? "P" : "U")}
                </div>
                <span className="max-w-[140px] truncate">
                  Bienvenido(a) {session.nombre ? session.nombre.split(" ")[0] : (session.tipo === "prestador" ? "Prestador" : "Usuario")}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setLoginTipo("usuario");
                  setRegisterTipo("usuario");
                  setLoginOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white active:scale-95 transition-all bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] shadow-md shadow-[#FF5A36]/25"
              >
                <User size={13} />
                <span>Ingresar</span>
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú principal" : "Abrir menú principal"}
              className={`relative p-2 focus:outline-none focus:ring-2 focus:ring-[#FF5A36] rounded-lg transition-colors ${
                !isDark
                  ? "text-[#475569] hover:text-[#1E2022] active:bg-[#F0ECE4]/60"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] active:bg-[#1E293B]/50"
              }`}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              {alertCount > 0 && !mobileOpen && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-[#FF5A36] ring-2 ring-white dark:ring-[#06080F]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div
            className={`border-b px-6 py-5 md:hidden backdrop-blur-xl ${
              !isDark
                ? "border-[#F0ECE4] bg-[#FFFFFF]/98 text-[#1E2022]"
                : "border-[#1E293B]/60 bg-[#06080F]/95 text-[#F1F5F9]"
            }`}
          >
            <div className="flex flex-col gap-3">
              {session ? (
                <>
                  {/* Account Header Card */}
                  <Link
                    href={session.tipo === "prestador" ? "/prestador" : "/explorar"}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-2xl border p-4 mb-1 transition-colors block ${
                      !isDark
                        ? "border-[#E2D9CC] bg-[#F7F3EE] hover:border-[#FF5A36]/40"
                        : "border-[#1E293B] bg-[#0A0F1A] hover:border-[#334155]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md ${session.tipo === "prestador" ? "bg-gradient-to-br from-[#FF5A36] to-[#FF8A65]" : "bg-emerald-600"}`}>
                        {session.nombre?.charAt(0).toUpperCase() || (session.tipo === "prestador" ? "P" : "U")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                          Bienvenido(a) {session.nombre || (session.tipo === "prestador" ? "Prestador" : "Usuario")}
                        </p>
                        <p className={`text-xs truncate ${!isDark ? "text-[#64748B]" : "text-[#64748B]"}`}>{session.email}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20">
                          {session.tipo === "prestador" ? "⭐ Prestador activo" : "👤 Usuario cliente"}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {pathname === "/prestador" || session.tipo === "prestador" ? (
                    <>
                      <Link
                        href="/prestador"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                          pathname === "/prestador"
                            ? "bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white shadow-md shadow-[#FF5A36]/25"
                            : !isDark
                            ? "border border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <Briefcase size={16} />
                        Mi panel de prestador
                      </Link>
                      <Link
                        href="/explorar"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition-all ${
                          !isDark
                            ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <Compass size={16} />
                        Explorar servicios
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-all mt-1"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                          pathname === "/perfil"
                            ? "bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] text-white shadow-md shadow-[#FF5A36]/25"
                            : !isDark
                            ? "border border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      <Link
                        href="/explorar"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition-all ${
                          !isDark
                            ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <Compass size={16} />
                        Explorar servicios
                      </Link>
                      <Link
                        href="/explorar?tab=alertas"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition-all relative ${
                          !isDark
                            ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <Bell size={16} />
                        Alertas
                        {alertCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A36] text-[10px] font-bold text-white ml-1">
                            {alertCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/explorar?tab=historial"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-center text-sm font-medium transition-all ${
                          !isDark
                            ? "border-[#E2D9CC] bg-[#F7F3EE] text-[#1E2022] hover:bg-[#EAE4DC]"
                            : "border-[#1E293B] bg-[#0A0F1A] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155]"
                        }`}
                      >
                        <History size={16} />
                        Historial
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-all mt-1"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div
                    className={`rounded-2xl p-4 text-center mb-1 ${
                      !isDark
                        ? "border border-[#FF5A36]/20 bg-[#FF5A36]/5"
                        : "border border-[#FF5A36]/30 bg-[#FF5A36]/10"
                    }`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${!isDark ? "text-[#1E2022]" : "text-[#F1F5F9]"}`}>
                      Accede a tu cuenta en AlToke
                    </p>
                    <p className={`text-xs ${!isDark ? "text-[#64748B]" : "text-[#94A3B8]"}`}>
                      Inicia sesión para contratar servicios o gestionar tus trabajos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setLoginTipo("usuario");
                      setRegisterTipo("usuario");
                      setLoginOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-center text-sm font-bold text-white shadow-lg active:scale-95 transition-all bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#FF4820] hover:to-[#FF6845] shadow-[#FF5A36]/25"
                  >
                    <User size={16} />
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setRegisterTipo("usuario");
                      setRegisterOpen(true);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-center text-sm font-medium transition-all ${
                      !isDark
                        ? "border border-[#E2DDD5] bg-[#FAF7F2] text-[#1E2022] hover:bg-[#F5F0E8] hover:border-[#D1C9BE]"
                        : "border border-[#1E293B] bg-[#0A0F1A] text-[#F1F5F9] hover:border-[#FF5A36]/40 hover:bg-[#FF5A36]/5"
                    }`}
                  >
                    <UserPlus size={16} />
                    Crear cuenta / Registrarse
                  </button>
                  <Link
                    href="/explorar"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 py-2 text-center text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
                  >
                    <Compass size={14} />
                    Explorar servicios sin cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        key={`${loginTipo}-${loginOpen ? "open" : "closed"}`}
        isOpen={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          handleLoginSuccess();
        }}
        onSwitchToRegister={(tipo) => {
          setLoginOpen(false);
          setRegisterTipo(tipo || "usuario");
          setRegisterOpen(true);
        }}
        defaultTipo={loginTipo}
      />
      <RegisterModal
        key={`${registerTipo}-${registerOpen ? "open" : "closed"}`}
        isOpen={registerOpen}
        onClose={() => {
          setRegisterOpen(false);
          handleLoginSuccess();
        }}
        defaultTipo={registerTipo}
      />
    </>
  );
}
