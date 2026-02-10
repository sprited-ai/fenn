# Installation Guide

## macOS (Recommended)

### Using Homebrew

```bash
brew tap sprited-ai/fenn
brew install fenn
```

**Benefits:**
- ✅ No security warnings (Homebrew is trusted by macOS)
- ✅ Automatic updates with `brew upgrade`
- ✅ Clean uninstall with `brew uninstall fenn`

### Using curl

```bash
curl -fsSL https://raw.githubusercontent.com/sprited-ai/fenn/main/install.sh | bash
```

The installer automatically handles macOS security settings.

## Manual Installation

Download from [GitHub Releases](https://github.com/sprited-ai/fenn/releases)

### macOS

1. Download `fenn-v0.1.0-macos.tar.gz`
2. Extract: `tar -xzf fenn-v0.1.0-macos.tar.gz`
3. **Remove quarantine flag**:
   ```bash
   xattr -d com.apple.quarantine fenn
   ```
4. Make executable: `chmod +x fenn`
5. Move to PATH: `mv fenn ~/.local/bin/`

**Alternative**: Right-click binary → "Open" → Click "Open" when prompted

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

## Security

All macOS binaries are:
- ✅ Code-signed with Apple Developer ID
- ✅ Notarized by Apple
- ✅ Built on GitHub Actions (auditable)

See [SECURITY.md](SECURITY.md) for details.
