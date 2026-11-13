# Fotmio Mobile (Capacitor)

Android/iOS ke liye sirf **shell/config** hai — app ka saara UI aur engine shared hai:

- UI: `../ui` (Svelte + Vite), production build `../ui/dist`
- Engine: Rust → WASM, UI ke bundle ke andar hi aata hai
- App ID: `com.dusrel.fotmio` · App name: **Fotmio**

Native `android/` aur `ios/` project folders **repo me commit nahi kiye gaye hain abhi** — woh pehli baar neeche wale steps se generate honge (user ke Mac / CI par), phir chaaho to commit kar sakte ho.

## Pehli baar setup (ek hi baar)

```bash
# Repo root se — saare workspaces install ho jayenge (ui, desktop, mobile)
pnpm install

# UI ka production build banao (capacitor isi dist ko bundle karta hai)
pnpm build          # root script: engine WASM + UI build

# Native projects generate karo (sirf ek-ek baar)
pnpm --filter fotmio-mobile run add:android
pnpm --filter fotmio-mobile run add:ios        # iOS ke liye Mac + Xcode lazmi hai
```

## Har naye build par

```bash
pnpm build                                   # fresh ui/dist
pnpm --filter fotmio-mobile run sync        # android + ios dono me web assets copy
```

## Android build (AAB — Play Store ke liye)

```bash
pnpm --filter fotmio-mobile run open:android   # Android Studio khulega, ya:
cd mobile/android && ./gradlew bundleRelease   # AAB: android/app/build/outputs/bundle/release/
```

Chahiye: JDK 17 + Android SDK. Release signing ke liye apna keystore chahiye hoga (abhi configure nahi hai — signing baad ka step hai).

## iOS build

```bash
pnpm --filter fotmio-mobile run open:ios       # Xcode khulega (sirf Mac par)
```

Chahiye: Mac + Xcode + Apple Developer account (signing ke liye). CI par abhi unsigned archive tak ka job bana hai (`.github/workflows/build.yml`).

## Plugins (official, pehle se package.json me)

| Plugin | Kaam |
|---|---|
| `@capacitor/camera` | Photo select (gallery/camera) — Step 1 "Image select" |
| `@capacitor/filesystem` | Compressed photo device par save karna |
| `@capacitor/share` | Result screen se asli OS share sheet |

## App icons — PENDING

Launcher icons abhi generate nahi hue hain. `ui/public/icons/` (192/512 PNG) ready hote hi `@capacitor/assets` se native icons/splash generate karne hain.
