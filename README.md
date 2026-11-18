# Financialhealthchecker

Build a clean, modern "Business Financial Health Checker" web app designed for startup founders and small business owners.

Core Flow:

Landing / Upload Screen: A clean hero section explaining that founders can upload their financial sheet (CSV or Excel .xlsx / .xls) to get an instant health check. Include a drag-and-drop file uploader AND a "Try with Sample Data" button (pre-loaded with realistic monthly startup revenue, expenses, cash balance, and receivables) so visitors can test it with one click without uploading a file.

File Parsing: Use papaparse and xlsx libraries in the browser so all data stays private on the user's device (no backend upload needed). Automatically detect columns like Date/Month, Revenue, COGS, Operating Expenses, Net Profit, and Cash Balance—and let the user quickly map columns if the names differ.

Financial Health Dashboard: Once loaded, show:

An overall Financial Health Score (0–100) with a clear status badge (Healthy, Needs Attention, or Critical).

4 Key Metric Cards: Gross Profit Margin %, Net Profit Margin %, Monthly Burn Rate, and Cash Runway (in months).

2 Clean Charts: A monthly Revenue vs. Expenses bar/line chart, and a Cash Balance trend line.

Plain-English Insights: 3–4 short, honest bullet points explaining what is going well and where money is leaking (written like a smart friend, not a stiff banker).

Design: Minimalist, crisp fintech aesthetic (off-white background, deep navy/slate text, emerald green for healthy metrics, coral red for warnings). Include a small footer credit: "Built by Yuvakshi Chopra".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://financialhealthchecker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c4750894-ab6b-438b-84a4-ec59b315cf31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
