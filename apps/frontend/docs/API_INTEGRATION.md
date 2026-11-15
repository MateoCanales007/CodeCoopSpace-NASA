# How the frontend uses the backend

Everything the farmer sees comes from the team's FastAPI server (`services/api`): the areas, the comparison, its explanation and the weather. The app bundles no data. This guide says what the frontend calls, what it does with each field, and how to check a server against it.

Source of truth for the contract is [`docs/CONTRATO.md`](../../../docs/CONTRATO.md). The method behind the figures is in [`docs/DATOS-Y-METODO.md`](../../../docs/DATOS-Y-METODO.md).

## 1. Where the frontend finds the server

Everything goes through one object, `rotationApi`, defined in [`src/api/index.ts`](../src/api/index.ts).

- **On the web, with no configuration:** the same host that serves the page, on port 8000. Open `http://<computer-ip>:8081` on a phone and the app calls `http://<computer-ip>:8000`.
- **Explicit address:** set `EXPO_PUBLIC_API_URL` in `apps/frontend/.env.local` (git-ignored) and restart Expo. Needed for native builds or when the server lives elsewhere.
- **CORS:** in development the API accepts origins from private networks. For a public deployment, set `FIELD_SHIFT_WEB_ORIGIN_REGEX` to empty and list exact origins in `FIELD_SHIFT_WEB_ORIGINS` on the server.
- From a phone, start Uvicorn with `--host 0.0.0.0`.
- Every `EXPO_PUBLIC_*` variable is visible to clients. Keys (Groq, Meteomatics) stay in `services/api/.env`.

If the server cannot be reached, the wizard and the results say so and offer a retry button. Nothing is made up. The reason is logged in the browser console with the `[Yago]` prefix.

## 2. Check a server

With the server running:

```powershell
cd apps/frontend
npm run check:api                           # http://127.0.0.1:8000
npm run check:api -- http://192.168.1.20:8000
```

It calls every endpoint, validates the responses with the same code the app uses and reports what is degraded. Example output:

```
Checking http://127.0.0.1:8000
  ok    GET /health → 200
  ok    GET /v1/climate/meteomatics → "available", 7 of 7 day(s), 2024-05-01 to 2024-05-07
  ok    end before start → 422
  ok    GET /v1/sites → 14 site(s): san-miguel, ahuachapan, …
  ok    POST /v1/compare → 3 scenario(s), climate "available", 7 source(s)
  note  the explanation was written by the rules, not by Groq (not_configured)
  ok    every optional field is present
  ok    duplicated priorities → 422
  ok    unsupported site → 422
All required checks passed.
```

`npm run examples:api` saves real answers of the running server in [`docs/examples`](examples).

## 3. Calls

Every request sends `Accept: application/json`, `Content-Type: application/json` and `Accept-Language: en` or `es`. The request timeout is 30 s, because the first comparison of an area waits for NASA POWER and for the explanation.

| Call | When | Example |
| --- | --- | --- |
| `GET /v1/sites` | When the app opens, and again if the language changes | [`sites.response.json`](examples/sites.response.json) |
| `POST /v1/compare` | When the results open, and every time the farmer changes the priority, an answer or the language | [`compare.request.json`](examples/compare.request.json) → [`compare.response.json`](examples/compare.response.json), [`compare.response.es.json`](examples/compare.response.es.json) |
| `GET /v1/climate/meteomatics` | After the comparison arrives, for the last 7 complete days at the area's approximate point | [`docs/CONTRATO.md`](../../../docs/CONTRATO.md) |

### Comparison request

```json
{
  "siteId": "san-miguel",
  "currentCrop": "sorghum",
  "soil": { "texture": "unknown", "drainage": "good" },
  "priorities": ["diversification", "water", "soil"]
}
```

- `priorities` always has the three values, without repeats. **The first one is what the farmer chose**; the other two follow in the default order.
- `soil.texture`: `sandy`, `loam`, `clay` or `unknown`. `soil.drainage`: `good`, `poor` or `unknown`. "Not sure" is sent as `unknown`.

### Language

The frontend translates its own labels (crop names, priorities, levels, source kinds). Free text written by the server is shown as-is: `criteria[].reason`, `summary`, `limitation`, `missingData`, `sources[].name`, `sources[].note`, `climate.note`, `climate.periodLabel`, `climate.metrics[].label`, `climate.alert.text`, `warnings[]`, `highlight.reason` and the four `explanation` texts.

## 4. What the UI does with each field

Required means the response is rejected without it and the screen shows the error state with a retry button.

| Field | Required | Used for |
| --- | --- | --- |
| `sites[].id`, `name` | yes | Area options in step 1 |
| `sites[].department`, `crops` | no | Hint under the area name; crops offered in step 2 |
| `explanation` (`consider`, `influence`, `caution`, `verify`) | no | "In short" card at the top of the results. Hidden when missing |
| `explanation.source`, `model`, `fallbackReason` | no | Says whether an AI model (Groq) or the rules wrote the wording, and why the AI was not used |
| `scenarios[].id`, `sequence`, `criteria[]` | yes | One card per rotation, with one pill per criterion |
| `scenarios[].role`, `summary`, `limitation`, `missingData`, `sourceIds` | no | Card tag, one-sentence explanation, "Watch out" block, source chips |
| `criteria[].priority` | yes | `water`, `soil` or `diversification` |
| `criteria[].level`, `reason`, `evidence` | no | Pill (`null` shows "No data"), text inside "See why and the sources" |
| `highlight` (`scenarioId`, `priority`, `reason`) | no | Dark "Best fit to …" card and the banner that explains what changed when the priority moves |
| `sources[]` (`id`, `name`, `url`, `version`, `kind`, `note`) | yes | Provenance chips, source list and links |
| `climate` (`status`, `kind`, `periodLabel`, `validYears`, `expectedYears`, `spatialScale`, `sourceId`) | yes (object) | Weather card: product, version, period, scale and years with data |
| `climate.metrics[]` (`id`, `value`, `unit`, `total`, `label`, `reason`) | no | One figure each. `total` renders "3 of 10". A `null` value shows "No data" with its `reason` |
| `climate.alert`, `note` | no | "Water alert" box; caveat under the figures |
| `isDemo` | no | "Demo mode" badge, when the weather is the saved one-week sample |
| `warnings[]`, `methodVersion` | no | Listed at the bottom; shown in the disclaimer |
| Meteomatics `status`, `start`, `end`, `days[]` | yes | "Recent weather, second source" card. Days with `null` are skipped, never filled in |
| Meteomatics `reason`, `coverage`, `provenance`, `stale` | no | Explanation when unavailable, days with data, source and retrieval date, saved-copy notice |

## 5. Degraded answers the UI handles

| Situation | Server answer | What the farmer sees |
| --- | --- | --- |
| Groq not configured, slow, rate limited or invalid | `explanation.source: "rules"` with `fallbackReason` | The same card, labelled "Automatic summary", with the reason in one line |
| NASA POWER down, saved copy available | `climate.stale: true` | Weather card with a note that it is a saved copy |
| NASA POWER down, only the one-week sample (San Miguel) | `climate.kind: "saved-sample"`, `isDemo: true` | "Demo mode" badge, "Saved weather sample" card, water shown as "No data" |
| NASA POWER down, no copy | `climate.status: "unavailable"` | Figures show "No data" with the cause; water is "No data"; soil and diversification still rated |
| "Not sure" answers | `missingData`, `warnings[]`, `explanation.verify` | Listed as things still to confirm; no option is penalised |
| Meteomatics unavailable | `status: "unavailable"` with `reason` | The card explains why and shows no figures |
| Invalid input (422) or server unreachable | HTTP error | Error state with a retry button |

## 6. Adding an endpoint

1. Add the request and response types to [`src/api/types.ts`](../src/api/types.ts).
2. Add the method to the `RotationApi` interface in [`src/api/rotationApi.ts`](../src/api/rotationApi.ts).
3. Implement it in [`httpRotationApi.ts`](../src/api/httpRotationApi.ts) and validate the answer in [`normalize.ts`](../src/api/normalize.ts).
4. Call it from a hook in [`src/hooks`](../src/hooks) (see `useSites.ts` and `useComparison.ts`); screens never call `fetch`.
