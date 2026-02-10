# Installation Guide

## Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/sprited-ai/fenn/main/install.sh | bash
```

All binaries are **code-signed and notarized** by Apple. No security warnings.

## Manual Installation

Download from [GitHub Releases](https://github.com/sprited-ai/fenn/releases)

### macOS

1. Download `fenn-v0.1.0-macos.tar.gz`
2. Extract: `tar -xzf fenn-v0.1.0-macos.tar.gz`
3. Make executable: `chmod +x fenn`
4. Move to PATH: `mv fenn ~/.local/bin/`

**Verify signature** (optional):
```bash
codesign --verify --verbose fenn
spctl -a -vv fenn
```

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
