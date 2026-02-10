# Installation Guide

Fenn is a **macOS-only** tool.

## Homebrew (Recommended)

```bash
brew tap sprited-ai/fenn
brew install fenn
```

**Benefits:**
- ✅ No security warnings
- ✅ Automatic updates: `brew upgrade fenn`
- ✅ Clean uninstall: `brew uninstall fenn`

## Manual Installation

Download from [GitHub Releases](https://github.com/sprited-ai/fenn/releases)

1. Download `fenn-v0.1.1-macos.tar.gz`
2. Extract: `tar -xzf fenn-v0.1.1-macos.tar.gz`
3. Remove quarantine: `xattr -d com.apple.quarantine fenn`
4. Make executable: `chmod +x fenn`
5. Move to PATH: `mv fenn ~/.local/bin/`

## Building from Source

```bash
git clone https://github.com/sprited-ai/fenn.git
cd fenn
python -m venv .venv
source .venv/bin/activate
cd cli
pip install -e .
```

## Security

All macOS binaries are:
- ✅ Code-signed with Apple Developer ID
- ✅ Notarized by Apple
- ✅ Built on GitHub Actions (auditable)

See [SECURITY.md](SECURITY.md) for details.
