# Installation Guide

## Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/sprited-ai/fenn/main/install.sh | bash
```

This automatically handles macOS security settings.

## Manual Installation

If you download the binary manually from [GitHub Releases](https://github.com/sprited-ai/fenn/releases):

### macOS

1. Download `fenn-v0.1.0-macos.tar.gz`
2. Extract it: `tar -xzf fenn-v0.1.0-macos.tar.gz`
3. **Remove quarantine flag** (important!):
   ```bash
   xattr -d com.apple.quarantine fenn
   ```
4. Make executable: `chmod +x fenn`
5. Move to PATH: `mv fenn ~/.local/bin/`

**If you get "Apple cannot verify" error:**
```bash
xattr -d com.apple.quarantine fenn
```

Or right-click the binary → "Open" → Click "Open" in the dialog.

### Linux

1. Download `fenn-v0.1.0-linux.tar.gz`
2. Extract: `tar -xzf fenn-v0.1.0-linux.tar.gz`
3. Make executable: `chmod +x fenn`
4. Move to PATH: `mv fenn ~/.local/bin/`

### Windows

1. Download `fenn-v0.1.0-windows.zip`
2. Extract `fenn.exe`
3. Add to PATH or run directly

## Building from Source

```bash
git clone https://github.com/sprited-ai/fenn.git
cd fenn
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
cd cli
pip install -e .
```

## Code Signing

The binaries are not code-signed. This is normal for open-source CLI tools. The install script automatically handles macOS Gatekeeper warnings.

To code-sign in the future (requires Apple Developer account - $99/year):
- Add `codesign` step to GitHub Actions
- Notarize with Apple
