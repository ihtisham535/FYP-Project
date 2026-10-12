# PharmaChain — Next.js + React (FYP)

Decentralized pharmaceutical supply-chain & counterfeit-detection prototype, converted from the
single-file HTML prototype into a Next.js 14 (App Router) / React 18 project. UI and UX are unchanged
(landing page is pixel-identical to the original).

## Run
```bash
npm install
npm run dev        # http://localhost:3000
# production:
npm run build && npm start
```
Requires Node.js 18.17+.

## Folder structure
```
pharmachain/
├─ package.json · next.config.mjs · jsconfig.json
├─ public/
│  ├─ images/hero-patient.png            hero image (was base64 in the HTML)
│  └─ portals/                           portal engines (one folder per portal)
│     ├─ shared/   01-icons · 02-data-model · 03-helpers · 04-verification-engine ·
│     │            05-core-actions · 06-sidebars · 07-charts-analytics · 08-reports-engine ·
│     │            09-table-filter · 10-navigation · 11-auth-flow · 12-toast
│     ├─ admin/admin.js
│     ├─ manufacturer/manufacturer.js
│     ├─ vendor/vendor.js
│     ├─ pharmacy/pharmacy.js            (POS, inventory, employees, subscription, demand insights)
│     ├─ doctor/doctor.js
│     └─ patient/patient.js              (mobile-style patient app, scan & verify, nearby pharmacies)
└─ src/
   ├─ app/  layout.jsx · page.jsx · globals.css   (all original CSS, unchanged)
   ├─ components/
   │  ├─ landing/   Navbar · Hero · Problem · Features · Roles · HowItWorks · Pricing · CallToAction · Footer
   │  ├─ auth/      RoleSelect · Login · Otp · Signup · ForgotPassword
   │  ├─ shell/     DesktopShell · PatientApp · BackToTop · Toast
   │  └─ LegacyRuntime.jsx   loads the portal scripts in order after the React shell mounts
   └─ lib/legacyManifest.js  script load order
```

## How it works
- Landing page, auth screens and the desktop/patient shells are React components.
- Chart.js is installed from npm (no CDN needed).
- Portal logic and page renderers live in `public/portals/<portal>/`, loaded in the order listed in
  `src/lib/legacyManifest.js` (they share state, so order matters).
- Demo state is persisted in `localStorage` under `pharmachain_demo_v1`.

## Demo logins
Choose a role on the "Select your workspace" screen; credentials are pre-filled (demo mode).
Pharmacy staff demo emails: sana@medicare.demo · hassan@medicare.demo · omar@prime.demo
