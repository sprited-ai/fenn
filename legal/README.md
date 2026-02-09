# Legal Documents

This directory contains the legal documents for Sprited and the build system for versioning and publishing them.

## Structure

- `terms.md` - The current Terms of Service (source of truth)
- `privacy.md` - The current Privacy Policy (coming soon)
- `build.js` - Build script for versioning documents
- `package.json` - Configuration and metadata

## How It Works

When you make changes to legal documents:

1. Edit `terms.md` (or other legal documents)
2. Update the "Last Updated: YYYY-MM-DD" date in the document
3. Run `npm run build`
4. The build script will:
   - Compute a hash of the document content
   - Create a versioned copy in `../ui/public/terms/<YYYY-MM-DD>-<hash>.md`
   - Generate HTML versions of the documents
   - Update `../ui/public/terms/index.md` with all versions
   - Update `package.json` with the latest version link
5. Build the UI: `cd ../ui && npm run build`
   - The UI will automatically pick up the latest versioned URLs from `legal/package.json`
   - All `/terms` and `/privacy` links in the app will use the versioned URLs
6. Commit all changes (both source and generated files)
7. Deploy to publish the new versions

## Usage

```bash
# Build legal documents
cd legal
npm run build

# Build UI (picks up the new versioned URLs)
cd ../ui
npm run build
```

## How Links are Updated in the App

The app automatically uses versioned URLs through `ui/src/legal-urls.ts`, which imports the latest URLs from `legal/package.json`. This means:

- When you run the legal build, it updates `legal/package.json` with the new versioned URLs
- When you build the UI, it reads those URLs and bundles them into the JavaScript
- All links throughout the app (`landing.tsx`, `SignupModal.tsx`, `SettingsModal.tsx`) use these versioned URLs
- No manual URL updates are needed in the source code

## Versioning Format

Versioned files use the format: `YYYY-MM-DD-<7-hex-hash>.md`

Example: `2026-02-05-2726c54.md`

- Date: Extracted from the "Last Updated: YYYY-MM-DD" field in the document
- Hash: First 7 characters of SHA-256 hash of content (ensures uniqueness)

## Notes

- Documents are immutable once published
- The hash prevents accidental overwrites of different content on the same date
- The date is extracted from the "Last Updated:" field in each document
- `../ui/public/terms/index.md` always lists all available versions
- `package.json` tracks the latest version URLs for programmatic access
- The UI automatically uses versioned URLs via `ui/src/legal-urls.ts`
