# Protocol Iroh

Protocol Iroh is a static client-side personal practice tracker. The app source now uses native ES modules under `src/` with Vite for local development, production builds, and test tooling, while all user data still stays in the browser under `localStorage` key `iroh_protocol_data`.

## Publish On GitHub Pages

This project is already set up for GitHub Pages with a workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml). The workflow installs dependencies, builds the site with Vite, and publishes `dist/`.

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Make sure the default branch is `main`.
4. In GitHub, open `Settings` -> `Pages`.
5. Under `Build and deployment`, set `Source` to `GitHub Actions`.
6. Push to `main` or rerun the `Deploy GitHub Pages` workflow.
7. After the workflow finishes, GitHub will publish the site at:
   - `https://<your-github-username>.github.io/<repository-name>/`

## Important Behavior

- Data is not shared between users. Each browser keeps its own `localStorage`.
- Data does not automatically sync across devices.
- Clearing browser storage or switching browsers/devices will lose that local data unless you use the built-in export/import flow.
- Book covers and descriptions require internet access because the app fetches metadata from external services.

## Local Use

Install dependencies and run the app locally with Vite:

1. Run `npm install`
2. Run `npm run dev`
3. Open the local URL Vite prints in the terminal

You can also build a production version with `npm run build`, which writes a deployable site to `dist/`.

If you prefer opening `index.html` directly from your filesystem, the repo also keeps a fallback `app.bundle.js` for `file://` use. After changing source files in `src/`, run `npm run bundle:file` or `npm run build` to refresh that local-open bundle.

## Testing

- Run `npm test` to execute the Vitest suite for the extracted pure helpers and state normalization logic.
