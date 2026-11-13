# Fotmio – Photo Compressor & Image Resizer

Fotmio har photo ko tumhare chune hue **exact size (KB/MB)** me compress karta hai — 100% offline, koi upload nahi, koi account nahi, koi ads nahi. Tumhari photos tumhare device se bahar jaati hi nahi.

**Ek hi codebase, paanch jagah:** Android · iOS · Windows · macOS · Web

## Flow

1. **Image select** — photo choose karo (ya drag & drop)
2. **Target size set** — 20 KB, 50 KB, 100 KB… ya quality/resize mode
3. **Result** — before/after compare, exact size, save/share

## Tech stack (locked — detail: docs/TECH_STACK.md)

- **UI:** TypeScript + Svelte + Vite (ek codebase)
- **Engine:** Rust crate — WASM (web/mobile) + native (desktop); Jpegli/MozJPEG, libwebp, oxipng; apni target-size binary-search logic
- **Wrappers:** Web = PWA · Android/iOS = Capacitor · Windows/macOS = Tauri 2
- **Repo:** ye monorepo (pnpm workspaces)

```
ui/       Svelte app
engine/   Rust engine crate
desktop/  Tauri config
mobile/   Capacitor config
docs/     Stack + engine API contract
```
