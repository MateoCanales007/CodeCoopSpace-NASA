# Yago · frontend

React Native + Expo + TypeScript app for web, Android and iOS. Yago helps a farmer in El Salvador compare the current crop rotation with two alternatives according to water, soil and what matters most to them.

The app opens directly: no accounts, profiles or sessions. It runs on bundled demo data until the backend is connected.

## Run it

```powershell
cd apps/frontend
npm ci
npm run web        # http://localhost:8081
```

| Command | What it does |
| --- | --- |
| `npm run web` | Expo dev server for the browser |
| `npm run start` | Expo menu, to open on a phone or emulator |
| `npm run typecheck` | TypeScript in strict mode |
| `npm run build:web` | Static export to `dist/` |
| `npm run check:api` | Checks a running backend against what the frontend expects |
| `npm run examples:api` | Regenerates the JSON examples in `docs/examples` |

To open it on a phone in the same Wi-Fi, use the LAN address Expo prints. If port 8081 is taken: `npx expo start --web --port 8090`.

## Connecting the backend

Read [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md). In short: set `EXPO_PUBLIC_USE_API=1` and `EXPO_PUBLIC_API_URL` in `.env.local`, restart Expo and run `npm run check:api`. The single connection point is [`src/api/index.ts`](src/api/index.ts).

## Structure

```
App.tsx                 App shell: fonts, providers, grain overlay
assets/
  art/                  Scene art: sharp cutout + "-mist" blurred layer, halos, grain
  brand/                Logo, symbol, app icon, favicon
  icons/                Sandy icons, one PNG each
docs/                   Backend integration guide and JSON examples
scripts/                Node scripts (API check, example generator)
src/
  api/                  Everything that talks to the backend
    demo/               Bundled demo data and its illustrative rules
  components/
    ui/                 Small reusable pieces: text, buttons, badge, icon…
    scene/              Welcome stage: scenes, natural motion, sand transition
  constants/            Domain option lists and their icons
  context/              React contexts (reduced motion)
  hooks/                Reusable logic: data loading, pointer, carousel
  i18n/                 English (default) and Spanish strings
  navigation/           The three-screen flow and its state
  screens/
    welcome/ wizard/ results/   One folder per screen, with its own parts
  theme/                Colors, fonts, asset maps, platform flags
  types/                Shared app types
  utils/                Pure helpers
```

## Conventions

- **One responsibility per file.** Screens compose; components draw; hooks hold logic; `src/api` is the only place that knows about HTTP.
- **Screens depend on `RotationApi`, not on `fetch`.** The real API, the demo data and the fallback are interchangeable implementations of that interface.
- **Extend by adding, not by editing.** A new welcome scene is an entry in `components/scene/scenes.ts`; a new kind of motion is an entry in `sceneMotion.ts`; a new wizard step is an entry in `screens/wizard/steps.tsx`; a new language is a file in `i18n/`.
- **No hard-coded text in components.** Every string lives in `src/i18n/en.ts` and `es.ts`; the `es` file is type-checked against `en`.
- **Colors and fonts come from `src/theme`.** Ink and ivory dominate; leaf green and maize yellow only appear as a halo or a detail.
- **Web and native from the same components.** Platform-specific code uses Expo file extensions (`SandMorph.web.tsx` / `SandMorph.tsx`).
- **Accessibility:** touch targets of at least 44 px, levels shown with a shape and a word (never color alone), labels on every control, and reduced motion respected everywhere.

## Design notes

- Start from 360 px wide; the desktop layout switches at 900 px.
- Primary actions sit at the bottom of the screen so the app can be used with one hand.
- Only opacity and position are animated. Blur is baked into the `-mist` images, which keeps animation cheap on modest phones.
- The sand transition between welcome scenes is drawn on a `<canvas>` and is web only. Native builds use a fade-and-slide. With reduced motion there is no sand and no autoplay.

## Data honesty

- The demo case is fictitious (San Miguel, approximate public coordinates) and is labelled "Demo data" on screen.
- The climate figures are a real NASA POWER sample for one week (May 1–7, 2024). It is past weather for a wide area, not a forecast and not a plot measurement.
- Crop rules in `src/api/demo` are illustrative. No agronomic value has been taken from CENTA yet.
