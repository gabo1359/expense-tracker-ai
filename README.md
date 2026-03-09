This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Demo | Core App

General walkthrough of the base expense tracker (no export features). Covers adding expenses with category/date/amount, editing and deleting entries, search and filter functionality, dashboard summary cards, monthly spending bar chart, and category breakdown pie chart — all persisted in localStorage.

https://github.com/user-attachments/assets/8f92ebe3-19a2-4f35-8635-bae6dd2c2775

## Data Export Feature Branches

Three different implementations of data export, each on its own branch with a completely different approach.

### V1 — Simple CSV Export (`feature-data-export-v1`)

A minimal, one-click CSV download button added to the header. No extra UI, no configuration — just click and get your file.

**Demo:**

https://github.com/user-attachments/assets/d596a8dd-234a-48c6-aa78-e5210dd56931

### V2 — Advanced Export Modal (`feature-data-export-v2`)

A multi-step modal wizard with format selection, filtering, data preview, and export progress states. Designed for power users who want full control.

**Demo:**

https://github.com/user-attachments/assets/9ea6fba6-9025-44ba-b665-7941ae7b489d

### V3 — Cloud-Integrated Export Hub (`feature-data-export-v3`)

A full dedicated "Export Hub" tab with cloud service integrations, export templates, history tracking, scheduled exports, and share links with QR codes. Built like a SaaS integrations page.

**Demo:**

https://github.com/user-attachments/assets/228e25db-78e7-4024-bbf7-bd7ab11f46d6

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
