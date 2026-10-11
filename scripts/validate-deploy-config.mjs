#!/usr/bin/env node
// scripts/validate-deploy-config.mjs
// Guardia de estabilidad: valida la config de deploy ANTES de push/build.
// Historial: "runtime": "nodejs18.x" en vercel.json rompió el build de Vercel
// (exige formato name@version, p. ej. now-php@1.0.0). Este script lo bloquea.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const errors = [];
const warnings = [];

// --- 1. vercel.json (opcional, pero si existe debe ser válido) ---
const vercelPath = resolve(root, 'vercel.json');
if (existsSync(vercelPath)) {
  let raw;
  try {
    raw = readFileSync(vercelPath, 'utf8');
  } catch (e) {
    errors.push(`vercel.json: no se pudo leer (${e.message})`);
    raw = null;
  }
  if (raw !== null) {
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch (e) {
      errors.push(`vercel.json: JSON inválido — ${e.message}`);
      cfg = null;
    }
    if (cfg && typeof cfg === 'object') {
      const ALLOWED_TOP = new Set([
        'functions', 'headers', 'rewrites', 'redirects', 'cleanUrls',
        'trailingSlash', 'regions', 'buildCommand', 'framework',
        'outputDirectory', 'installCommand', 'devCommand', 'git',
        'crons', 'public', 'env', 'buildEnv', 'queue',
      ]);
      for (const key of Object.keys(cfg)) {
        if (!ALLOWED_TOP.has(key)) {
          errors.push(`vercel.json: clave desconocida "${key}" (no está en la lista segura de este validador; si es intencional, agrégala a ALLOWED_TOP en scripts/validate-deploy-config.mjs y documenta por qué)`);
        }
      }

      const ALLOWED_FN = new Set(['runtime', 'maxDuration', 'memory', 'includeFiles', 'excludeFiles']);
      const RUNTIME_WITH_VERSION = /^(@[\w.-]+\/)?[\w.-]+@\d+(\.\d+)*(-[\w.-]+)?$/;

      if (cfg.functions && typeof cfg.functions === 'object') {
        for (const [pattern, fnCfg] of Object.entries(cfg.functions)) {
          if (!fnCfg || typeof fnCfg !== 'object') {
            errors.push(`vercel.json: functions["${pattern}"] debe ser un objeto`);
            continue;
          }
          for (const key of Object.keys(fnCfg)) {
            if (!ALLOWED_FN.has(key)) {
              errors.push(`vercel.json: functions["${pattern}"].${key} no está permitido`);
            }
          }
          if ('runtime' in fnCfg) {
            const rt = fnCfg.runtime;
            if (typeof rt !== 'string' || !RUNTIME_WITH_VERSION.test(rt)) {
              errors.push(
                `vercel.json: functions["${pattern}"].runtime = ${JSON.stringify(rt)} es INVÁLIDO. ` +
                `Vercel exige formato name@version (p. ej. "now-php@1.0.0"). ` +
                `Para Next.js NO declares runtime en vercel.json: usa "export const runtime = \"nodejs\"" en el route file.`
              );
            } else if (/^(nodejs|node|@vercel\/node)/.test(rt)) {
              errors.push(
                `vercel.json: functions["${pattern}"].runtime = "${rt}" — no declares runtimes de Node en vercel.json; ` +
                `Next.js los maneja automáticamente (o "export const runtime = \"nodejs\"" en el route file).`
              );
            }
          }
        }
      } else if ('functions' in cfg) {
        errors.push('vercel.json: "functions" debe ser un objeto');
      }
    }
  }
} else {
  // Sin vercel.json está bien: Next.js + Vercel lo detectan todo solo.
}

// --- 2. Route files de API: runtime solo puede ser "nodejs" | "edge" ---
const apiDir = resolve(root, 'src/app/api');
if (existsSync(apiDir)) {
  const { readdirSync } = await import('node:fs');
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = resolve(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('route.ts') || p.endsWith('route.js') ? [p] : [];
  });
  for (const file of walk(apiDir)) {
    const src = readFileSync(file, 'utf8');
    const m = src.match(/export\s+const\s+runtime\s*=\s*["']([^"']+)["']/);
    if (m && !['nodejs', 'edge'].includes(m[1])) {
      errors.push(`${file.replace(root + '/', '')}: runtime "${m[1]}" inválido (solo "nodejs" o "edge")`);
    }
  }
}

// --- 3. package.json / next.config ---
if (!existsSync(resolve(root, 'package.json'))) {
  errors.push('package.json ausente');
} else {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  if (!pkg.scripts?.build) errors.push('package.json: falta script "build"');
  if (!pkg.dependencies?.next) errors.push('package.json: falta dependencia "next"');
}
if (!existsSync(resolve(root, 'next.config.ts')) && !existsSync(resolve(root, 'next.config.js')) && !existsSync(resolve(root, 'next.config.mjs'))) {
  errors.push('next.config ausente');
}

// --- Reporte ---
if (warnings.length) {
  console.log('⚠️  Avisos:');
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.error('❌ Validación de deploy FALLÓ:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('\nBuild/push bloqueado para proteger la estabilidad del sitio.');
  process.exit(1);
}
console.log('✅ Config de deploy válida.');
