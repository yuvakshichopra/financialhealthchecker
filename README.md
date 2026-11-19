# Financial Health Checker

A browser-based financial analysis tool for startup founders and small business owners.

Financial Health Checker turns financial spreadsheets into a dashboard that makes it easier to understand how a business is performing. Upload your data to view key financial metrics, track cash flow, and identify areas that may need attention.

## Features

- **Financial Data Upload:** Supports CSV and Excel files (`.csv`, `.xlsx`, `.xls`).
- **Sample Data:** Try the tool without uploading your own financial records.
- **Automatic Column Detection:** Recognises common fields such as revenue, expenses, net profit, and cash balance.
- **Column Mapping:** Manually match spreadsheet columns when automatic detection doesn't get them right.
- **Financial Health Score:** An overall score out of 100, categorised as Healthy, Needs Attention, or Critical.
- **Key Financial Metrics:** Gross profit margin, net profit margin, monthly burn rate, and cash runway.
- **Visual Dashboard:** Monthly revenue vs. expenses and cash balance trend charts.
- **Financial Insights:** Short, plain-English observations about business performance and potential areas of concern.

## Privacy

Financial data is processed directly in the browser using PapaParse and XLSX. Files do not need to be uploaded to an external backend for analysis.

## Tech Stack

- React
- TypeScript / JavaScript
- PapaParse
- XLSX
- Charting and UI libraries

## Live Demo

[financialhealthchecker.lovable.app](https://financialhealthchecker.lovable.app/)

## Run Locally

Make sure you have Node.js and npm installed.

```bash
git clone YOUR-REPOSITORY-URL
cd YOUR-REPOSITORY-NAME
npm install
npm run dev
