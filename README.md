# Essential Logic OHIF Viewer - Custom Medical Imaging Platform

A modernized, highly customized deployment of the [OHIF Viewer](https://ohif.org/) featuring a premium dark-mode UI, smooth animations, and a secure Supabase-backed authentication layer proxying DICOM traffic to an Orthanc backend.

---

## 🎯 Key Features

- **Modernized UI/UX:** Built with a custom extension (`custom-ui`) featuring framer-motion animations, glassmorphism overlays, and a premium dark mode out-of-the-box.
- **Secure Authentication:** Integrated with Supabase Auth for user management and secure routing.
- **Proxy-Based DICOM Pipeline:** Bypasses CORS and authentication stripping issues using a Supabase Edge Function (`orthanc-proxy`) to securely stream bulk DICOM payload from Orthanc directly to the viewer.
- **Hostinger VPS Ready:** Comes with deployment files optimized for Nginx reverse proxying and Docker Compose.
- **Custom Worklist & Storage Quotas:** Per-user study isolation and quota management via Supabase Edge Functions (`account-manager`).

---

## 📸 Screenshots & Walkthrough

### 1. Login & Authentication
*Description: The secure entry point handled via Supabase Auth.*
> **[PLACEHOLDER: Add Screenshot of Login Screen Here]**
> `![Login Screen](docs/screenshots/login.png)`

### 2. Custom Study Browser (Worklist)
*Description: The modernized worklist showing user-uploaded studies with glassmorphism styling.*
> **[PLACEHOLDER: Add Screenshot of Worklist Here]**
> `![Study Worklist](docs/screenshots/worklist.png)`

### 3. Medical Viewer (Dark Mode)
*Description: The main OHIF viewing interface displaying a DICOM study with custom annotation panels.*
> **[PLACEHOLDER: Add Screenshot of Main Viewer Here]**
> `![OHIF Viewer](docs/screenshots/viewer.png)`

### 4. Image Upload & Quota Management
*Description: The custom DICOM upload modal showing progress UI and user storage limits.*
> **[PLACEHOLDER: Add Screenshot of Upload Modal Here]**
> `![Upload Modal](docs/screenshots/upload.png)`

---

## 🏗️ Architecture Overview

Our stack separates the front-end viewer from the heavy lifting of the DICOM server using an authentication proxy.

```mermaid
graph TD;
    Client[Browser (OHIF Viewer)] -->|DICOMweb via Proxy| SupabaseEdge[Supabase Edge Function: orthanc-proxy]
    Client -->|Auth & Metadata| SupabaseDB[(Supabase PostgreSQL)]
    SupabaseEdge -->|Native Auth| Orthanc[(Orthanc DICOM Server)]
    Client -->|Static Assets| Nginx[Nginx Web Server]
```

---

## 🚀 Deployment Guide (Hostinger VPS)

This project is tailored for deployment on a Linux VPS (like Hostinger) running Docker, Nginx, and Node.js.

### 1. Environment Setup

Copy your environment configurations, ensuring secrets are NEVER committed to Git.
```bash
cp .env.example .env
# Edit .env with your specific Supabase and Orthanc URLs/Keys
```
*Note: Make sure to check `.gitignore` to verify `.env` is safe from version control. Never commit `SUPABASE_SERVICE_ROLE_KEY`!*

### 2. Deploying Edge Functions (Supabase)

The edge functions handle CORS, proxying, and user limits securely on the backend.
```bash
cd supabase
supabase functions deploy orthanc-proxy --no-verify-jwt
supabase functions deploy account-manager --no-verify-jwt
```
Set the environment secrets for your functions:
```bash
supabase secrets set --env-file ../.env
```

### 3. Building the Viewer for Production

Compile the OHIF viewer along with our `custom-ui` extensions.
```bash
yarn install:frozen
yarn run build:viewer
```
The output will be placed in the `platform/app/build/` directory.

### 4. Running Services Locally / VPS (Docker Compose)

Start up the Orthanc backend and dependent services.
```bash
cd platform/app/.recipes/Nginx-Orthanc
docker compose -f docker-compose.yml up -d
```

### 5. Nginx Configuration

Make sure your server block is set up to serve the `build` directory and allow large uploads (e.g., `client_max_body_size 500M;`). Ensure valid SSL certificates via Certbot for secure DICOMweb routing.

---

## 🛠️ Development

To run the custom extensions locally:

1. Install dependencies: `yarn install:frozen`
2. Start the local dev server: `yarn run dev:fast`
3. Access the viewer typically at `http://localhost:3000`

---

## 📝 License

This project is built on top of the open-source OHIF Viewer framework. Please refer to the root `LICENSE` file for distribution rights.
