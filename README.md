# Protocol Iroh

Protocol Iroh is a single-page personal practice tracker built as a static HTML app. It stores all user data in the browser with `localStorage` under the key `iroh_protocol_data`, so each person using the site keeps their own private copy on their own device.

## Publish On GitHub Pages

This project is already set up for GitHub Pages with a workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

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
- Clearing browser storage or switching browsers/devices will lose that local data unless you add an export/import flow later.
- Book covers and descriptions require internet access because the app fetches metadata from external services.

## Local Use

You can still open `index.html` directly in a browser for local use, but GitHub Pages is the easiest way to share the app with someone else through a stable URL.
