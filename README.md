# The Beacon — GitHub-ready website

This repository is ready to upload to GitHub and publish as a static website. It has no package installation and no build command.

## Fastest launch: GitHub Pages

1. Create a new public GitHub repository.
2. Upload every file and folder from this package into the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then save.
6. GitHub will provide a public URL after deployment.

## Cloudflare Pages

1. Connect the GitHub repository to Cloudflare Pages.
2. Framework preset: **None**.
3. Build command: leave blank.
4. Build output directory: `/`.
5. Deploy.

## Publish a new edition

Edit `content/edition-002.json`. The design updates automatically from that file.

Required editorial rules are represented in the data model:
- Every major story has `bottom_line`.
- Healthcare stories have `provider_impact` and `patient_impact`.
- Every edition includes `radar`.

## Local preview

From the repository folder run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Do not double-click `index.html`; browsers block local JSON loading for security.
