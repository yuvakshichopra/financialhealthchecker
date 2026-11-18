<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- GitHub Pages CI prerenders the public upload screen and stages only static client files into `dist`; never publish the server bundle to static hosting.
- Keep Vite assets relative and supply the Pages base path to the client router so repository subdirectory deployments resolve correctly.
- Financial files are parsed only in the browser (papaparse / SheetJS loaded via dynamic import in `src/lib/finance/parse-file.ts`) — privacy promise: no upload, no backend.
- Scoring, metrics and insight rules live in pure functions in `src/lib/finance/analyze.ts`, covered by `analyze.test.ts`; UI components only render the `Analysis` result.
- SheetJS is installed from the official CDN tarball, not the outdated npm `xlsx` package.
- Every uploaded grid goes through `sheetFromMatrix` (`clean-sheet.ts`) and amounts through `parseNumber` (`columns.ts`) so messy cells are cleaned before any ratio is computed; both are covered by `clean-sheet.test.ts`.
- The summary report is a print-only component (`SummaryReport`, `hidden print:block`) exported via `window.print()` → Save as PDF; no PDF library, so data never leaves the device.
