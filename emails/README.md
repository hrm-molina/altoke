# Plantillas de Correo de AlToke Chile 🇨🇱

Plantillas HTML responsivas y profesionales con el diseño unificado **Warm Sunset** de AlToke Chile para configurar en **Supabase Auth**.

---

## 📁 Archivos disponibles:
- `confirm-signup.html`: Plantilla para **Confirmación de registro / Verificación de correo**.
- `reset-password.html`: Plantilla para **Recuperación / Restablecimiento de contraseña**.

---

## 🚀 Cómo configurarlo en Supabase:

1. Entra a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard).
2. En el menú lateral izquierdo ve a **Authentication** &rarr; **Email Templates**.
3. Selecciona la pestaña **"Confirm signup"** (Confirmación de registro):
   - **Subject / Asunto:** `⚡ Confirma tu cuenta en AlToke Chile`
   - **Body / Cuerpo (HTML):** Copia todo el contenido de [`confirm-signup.html`](./confirm-signup.html) y pégalo.
4. Presiona **Save** (Guardar).
5. *(Opcional)* Selecciona la pestaña **"Reset Password"**:
   - **Subject / Asunto:** `🔐 Restablece tu contraseña en AlToke Chile`
   - **Body / Cuerpo (HTML):** Copia todo el contenido de [`reset-password.html`](./reset-password.html) y pégalo.
   - Presiona **Save**.

---

## ⚙️ Variables dinámicas de Supabase utilizadas:
- `{{ .ConfirmationURL }}`: Enlace seguro generado automáticamente por Supabase que redirige al callback de activación de cuenta.
