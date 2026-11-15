# Connecting the backend

Guide for the backend team. The frontend already runs the whole flow on bundled demo data; this document says exactly what it calls, what it needs back, and how to check your API against it.

Source of truth for the contract is [`docs/CONTRATO.md`](../../../docs/CONTRATO.md) (status: proposal). This guide only adds what the frontend does with it.

## 1. Switch the frontend to your API

Create `apps/frontend/.env.local` (it is git-ignored):

```
EXPO_PUBLIC_USE_API=1
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000
```

Restart Expo (`npm run web`). No screen or component changes: everything goes through one object, `rotationApi`, defined in [`src/api/index.ts`](../src/api/index.ts).

- If a call fails, times out (8 s) or returns something that does not match the contract, the app falls back to the demo data and shows a warning at the bottom of the results. The reason is logged in the browser console with the `[Yago]` prefix.
- **CORS:** the API allows `http://localhost:8081` and `http://127.0.0.1:8081` by default. If Expo runs on another port or you open it from a phone, add that exact origin to `FIELD_SHIFT_WEB_ORIGINS` on the server.
- From a phone, use the LAN IP of the machine in `EXPO_PUBLIC_API_URL` and start Uvicorn with `--host 0.0.0.0`.
- Every `EXPO_PUBLIC_*` variable is visible to clients. Provider credentials (for example Meteomatics) stay on the server.

## 2. Check your API

With your server running:

```powershell
cd apps/frontend
npm run check:api                           # http://127.0.0.1:8000
npm run check:api -- http://192.168.1.20:8000
```

It calls every endpoint, validates the responses with the same code the app uses and lists the optional fields you are not sending yet. Example output:

```
Checking http://127.0.0.1:8000
  ok    GET /health → 200
  ok    GET /v1/sites → 1 site(s): san-miguel-demo
  ok    POST /v1/compare → 3 scenario(s), climate "partial", 4 source(s)
  note  optional fields not sent yet (the UI hides those parts): highlight, scenarios[].summary
  ok    duplicated priorities → 422
  ok    unsupported site → 422
All required checks passed.
```

## 3. Endpoints the frontend calls

Both requests send `Accept: application/json`, `Content-Type: application/json` and `Accept-Language: en` or `es`.

| Call | When | Example |
| --- | --- | --- |
| `GET /v1/sites` | Once when the app opens, and again if the language changes | [`sites.response.json`](examples/sites.response.json) |
| `POST /v1/compare` | When the results open, and every time the farmer changes the priority, the answers or the language | [`compare.request.json`](examples/compare.request.json) → [`compare.response.json`](examples/compare.response.json) |

Other examples: [`compare.response.minimal.json`](examples/compare.response.minimal.json) is the smallest response the UI accepts; [`compare.response.es.json`](examples/compare.response.es.json) is the same comparison in Spanish. Regenerate all of them with `npm run examples:api`.

### Request

```json
{
  "siteId": "san-miguel-demo",
  "currentCrop": "maize",
  "soil": { "texture": "unknown", "drainage": "unknown" },
  "priorities": ["soil", "water", "diversification"]
}
```

- `priorities` always has the three values, without repeats. **The first one is what the farmer chose**; the other two follow in the default order.
- `currentCrop`: `maize`, `bean` or `sorghum`.
- `soil.texture`: `sandy`, `loam`, `clay` or `unknown`. `soil.drainage`: `good`, `poor` or `unknown`. The contract example only shows `unknown`; the other values are a proposal (see section 5).

### Language

The frontend translates its own labels (crop names, priorities, levels, source kinds). Free text written by the backend is shown as-is: `criteria[].reason`, `summary`, `limitation`, `missingData`, `sources[].name`, `sources[].note`, `climate.note`, `climate.alert.text`, `warnings[]` and `highlight.reason`. Return those in the language of `Accept-Language`, defaulting to English. If you only support one language for now, the app still works; those sentences simply will not switch.

## 4. What the UI does with each field

Required means the response is rejected without it (and the app falls back to demo data).

| Field | Required | Used for |
| --- | --- | --- |
| `sites[].id`, `name` | yes | Area options in step 1 |
| `sites[].crops` | no | Crops offered in step 2; all three when missing |
| `sites[].department`, `isDemo` | no | Hint under the area name |
| `scenarios[].id` | yes | Stable identity; also referenced by `highlight.scenarioId` |
| `scenarios[].sequence` | yes | Card title, for example Maize → Beans |
| `scenarios[].criteria[]` | yes | One pill per criterion |
| `criteria[].priority` | yes | `water`, `soil` or `diversification` |
| `criteria[].level` | no | `favorable`, `neutral`, `unfavorable`; `null` shows "No data" |
| `criteria[].reason` | no | Explanation inside "See why and the sources" |
| `criteria[].evidence` | no | Source ids; decides which source chips the card shows |
| `sources[]` (`id`, `name`, `url`, `version`, `kind`, `note`) | yes | Provenance chips, source list and links. `kind`: `nasa`, `local-reference`, `user-input`, `demo-assumption` |
| `climate.status`, `period`, `coverage`, `sourceId` | yes (object) | Climate card: product, version, period and days with data |
| `climate.metrics[]` | no | Looked up by `id`: `precipTotal` (mm), `dryDays`, `tMaxMean` (°C). A missing or `null` value shows "No data" |
| `warnings[]` | no | Listed at the bottom of the results |
| `methodVersion` | no | Shown in the disclaimer |

## 5. Proposed extensions (not in the contract yet)

These fields make the results clearer for the farmer. The UI works without them, but please confirm or reject them in the contract issue so both sides stop guessing.

| Field | What it enables | Without it |
| --- | --- | --- |
| `highlight: { scenarioId, priority, reason }` | Dark "Best fit to …" card and the banner that explains what changed when the priority moves. `reason` is a clause that completes "To save water, …" | No card is emphasised and no banner is shown |
| `scenarios[].role`: `current` or `alternative` | Tags "What you do today" / "Another option" | Inferred: a sequence that repeats one crop is the current one |
| `scenarios[].summary` | One-sentence explanation on the card | Hidden |
| `scenarios[].limitation` | The "Watch out" line | Hidden |
| `scenarios[].missingData` | What we still do not know for that option | Hidden |
| `scenarios[].sourceIds` | Sources cited by the card | Derived from `criteria[].evidence` |
| `climate.alert: { priority, text }` | "Water alert" box: how the NASA data affects the comparison | Hidden |
| `climate.note` | Scale and period caveat under the climate figures | Hidden |
| `isDemo` | "Demo data" badge on the results | No badge |
| `soil.texture` / `soil.drainage` values other than `unknown` | Lets what the farmer knows change the comparison | Send `unknown` only |

## 6. Errors

| Status | Meaning | What the app does today |
| --- | --- | --- |
| 200 | Comparison, possibly partial, with `warnings` | Renders it |
| 422 | Invalid input | Falls back to demo data with a warning; the request should never be invalid, so treat it as a bug |
| 503 | A required source is unavailable and there is no valid copy | Falls back to demo data with a warning |
| network error / timeout | Server unreachable | Falls back to demo data with a warning |

The fallback keeps the hackathon demo alive. Once the API is stable, remove it by using `createHttpRotationApi` directly in [`src/api/index.ts`](../src/api/index.ts); the results screen already has an error state with a retry button.

## 7. Adding an endpoint

1. Add the request and response types to [`src/api/types.ts`](../src/api/types.ts).
2. Add the method to the `RotationApi` interface in [`src/api/rotationApi.ts`](../src/api/rotationApi.ts).
3. Implement it in [`httpRotationApi.ts`](../src/api/httpRotationApi.ts) (real call, validated in [`normalize.ts`](../src/api/normalize.ts)), in [`demoRotationApi.ts`](../src/api/demoRotationApi.ts) (bundled data) and in [`withDemoFallback.ts`](../src/api/withDemoFallback.ts).
4. Call it from a hook in [`src/hooks`](../src/hooks) (see `useSites.ts` and `useComparison.ts`); screens never call `fetch`.

TypeScript will point at every implementation that is missing the new method.
