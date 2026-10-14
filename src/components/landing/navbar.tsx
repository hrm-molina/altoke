"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Zap, LogOut, History, Bell, Compass } from "lucide-react";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";
import { supabaseAuth, onAuthStateChange, type AuthUser } from "@/lib/supabase-auth";

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E293B]/60 bg-[#06080F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 sm:px-10 lg:px-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F1F5F9]">
              AlToke<span className="text-blue-400">Chile</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {session ? (
              <div className="flex items-center gap-5 ml-4">
                {pathname === "/prestador" || session.tipo === "prestador" ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-xs font-bold text-white shadow-sm">
                        {session.nombre?.charAt(0) || "P"}
                      </div>
                      <span className="text-sm font-semibold text-[#F1F5F9]">
                        {session.nombre || session.email}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/explorar"
                      className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                    >
                      <Compass size={15} />
                      Explorar
                    </Link>
                    <Link
                      href="/explorar?tab=alertas"
                      className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all relative"
                    >
                      <Bell size={15} />
                      Alertas
                      {alertCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {alertCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/explorar?tab=historial"
                      className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                    >
                      <History size={15} />
                      Historial
                    </Link>
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-[#94A3B8]">
                        {session.nombre?.charAt(0) || "U"}
                      </div>
                      <span className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
                        {session.nombre || session.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
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
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
                >
                  Iniciar sesión
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Cerrar menú principal" : "Abrir menú principal"}
            className="text-[#94A3B8] hover:text-[#F1F5F9] md:hidden p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-b border-[#1E293B]/60 bg-[#06080F]/95 backdrop-blur-xl px-6 py-5 md:hidden">
            <div className="flex flex-col gap-3">
              {session ? (
                <>
                  {pathname === "/prestador" || session.tipo === "prestador" ? (
                    <>
                      <div className="flex items-center gap-3 px-1 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-bold text-white shadow-sm">
                          {session.nombre?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#F1F5F9]">
                            {session.nombre || "Prestador"}
                          </p>
                          <p className="text-xs text-[#64748B]">{session.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/perfil"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-1 py-2 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-sm font-bold text-[#94A3B8]">
                          {session.nombre?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#F1F5F9]">
                            {session.nombre || "Usuario"}
                          </p>
                          <p className="text-xs text-[#64748B]">{session.email}</p>
                        </div>
                      </Link>
                      <Link
                        href="/explorar"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 text-center text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                      >
                        <Compass size={15} />
                        Explorar
                      </Link>
                      <Link
                        href="/explorar?tab=alertas"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 text-center text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all relative"
                      >
                        <Bell size={15} />
                        Alertas
                        {alertCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {alertCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/explorar?tab=historial"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A0F1A] py-3 text-center text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] transition-all"
                      >
                        <History size={15} />
                        Historial
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginTipo("usuario");
                    setRegisterTipo("usuario");
                    setLoginOpen(true);
                  }}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all btn-glow"
                >
                  Iniciar sesión
                </button>
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
