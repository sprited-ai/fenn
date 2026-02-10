# How to install UX

here’s exactly what to do, in order, assuming Fenn is a Python CLI and you want an Ollama-style install (prebuilt binary) plus an optional Brew tap later.

0) Pick the entrypoint

You need one command that runs your CLI.

Best: make python -m fenn work.

In your repo:

fenn/__main__.py should call your CLI main().

Example fenn/__main__.py:

from fenn.cli import main

if __name__ == "__main__":
    raise SystemExit(main())


(If you already have an entrypoint, keep it—just ensure there’s a stable module to run.)


1) Make a local PyInstaller binary (proof it works)

From repo root:

python3 -m venv .venv
source .venv/bin/activate
pip install -U pip pyinstaller
pip install -e .   # or pip install -r requirements.txt
pyinstaller -n fenn --onefile -m fenn
./dist/fenn --help


If that runs, you’re 80% done.

Output: dist/fenn (or dist/fenn.exe on Windows)

2) Decide your first release targets

Do this first pass:

macOS arm64 (Apple Silicon)

macOS x86_64 (Intel)

linux x86_64

windows x86_64

You can start with macOS only if you want less work, but CI matrix makes all 4 pretty manageable.

3) Add GitHub Actions to build binaries on tag

Create: .github/workflows/release.yml

name: build-and-release

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install deps
        run: |
          python -m pip install -U pip pyinstaller
          python -m pip install -e .

      - name: Build binary
        run: |
          pyinstaller -n fenn --onefile -m fenn

      - name: Package
        shell: bash
        run: |
          mkdir -p out
          if [[ "${{ runner.os }}" == "Windows" ]]; then
            cp dist/fenn.exe out/
          else
            cp dist/fenn out/
          fi

      - uses: actions/upload-artifact@v4
        with:
          name: fenn-${{ runner.os }}
          path: out/*

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Create release assets
        run: |
          ls -R artifacts
          mkdir -p release
          # macOS artifact
          tar -czf release/fenn-${GITHUB_REF_NAME}-macos.tar.gz -C artifacts/fenn-macOS fenn || true
          # Linux artifact
          tar -czf release/fenn-${GITHUB_REF_NAME}-linux.tar.gz -C artifacts/fenn-Linux fenn || true
          # Windows artifact
          (cd artifacts/fenn-Windows && zip -r ../../release/fenn-${GITHUB_REF_NAME}-windows.zip fenn.exe) || true

      - uses: softprops/action-gh-release@v2
        with:
          files: release/*


Then, release by tagging:

git tag v0.1.0
git push origin v0.1.0


This will create a GitHub Release with downloadable assets.

4) Add an install.sh (curl installer)

Put this at install.sh in your repo (and serve it from your site later if you want):

#!/usr/bin/env bash
set -euo pipefail

REPO="YOUR_GITHUB_ORG_OR_USER/fenn"
VERSION="${1:-latest}"

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin) PLATFORM="macos" ;;
  Linux)  PLATFORM="linux" ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
esac

if [[ "$VERSION" == "latest" ]]; then
  TAG="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep -m1 '"tag_name"' | cut -d'"' -f4)"
else
  TAG="$VERSION"
fi

ASSET=""
if [[ "$PLATFORM" == "macos" ]]; then
  # Start simple: one macos tarball from CI (you can split arm64/x86_64 later)
  ASSET="fenn-${TAG}-macos.tar.gz"
elif [[ "$PLATFORM" == "linux" ]]; then
  ASSET="fenn-${TAG}-linux.tar.gz"
fi

URL="https://github.com/$REPO/releases/download/$TAG/$ASSET"

INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

echo "Downloading fenn $TAG for $PLATFORM..."
curl -fsSL "$URL" -o /tmp/fenn.tar.gz

echo "Installing to $INSTALL_DIR..."
tar -xzf /tmp/fenn.tar.gz -C /tmp
mv /tmp/fenn "$INSTALL_DIR/fenn"
chmod +x "$INSTALL_DIR/fenn"
rm /tmp/fenn.tar.gz

echo ""
echo "✅ fenn installed to $INSTALL_DIR/fenn"
echo ""
echo "Make sure $INSTALL_DIR is in your PATH."
echo "Add this to your ~/.bashrc or ~/.zshrc:"
echo ""
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "Then run: source ~/.zshrc (or restart your shell)"


Now users can run:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/fenn/main/install.sh | bash
```

Or install a specific version:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/fenn/main/install.sh | bash -s v0.1.0
```

5) Serve install.sh from your site (optional but nice)

If you have a domain (e.g., fenn.dev), serve the install script at:

```
https://fenn.dev/install.sh
```

Then your install command becomes:

```bash
curl -fsSL https://fenn.dev/install | sh
```

Much cleaner! You can use Cloudflare Pages, Vercel, or GitHub Pages to redirect /install to the raw GitHub script.

6) Add Brew tap (optional, for macOS power users)

Create a new repo: fenn-homebrew (or homebrew-fenn)

Add a Formula file: Formula/fenn.rb

```ruby
class Fenn < Formula
  desc "Your CLI description"
  homepage "https://github.com/YOUR_ORG/fenn"
  version "0.1.0"
  
  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/YOUR_ORG/fenn/releases/download/v0.1.0/fenn-v0.1.0-macos.tar.gz"
      sha256 "YOUR_SHA256_HERE"
    else
      url "https://github.com/YOUR_ORG/fenn/releases/download/v0.1.0/fenn-v0.1.0-macos.tar.gz"
      sha256 "YOUR_SHA256_HERE"
    end
  end

  def install
    bin.install "fenn"
  end

  test do
    system "#{bin}/fenn", "--version"
  end
end
```

Then users can install via:

```bash
brew tap YOUR_ORG/fenn
brew install fenn
```

To update the formula on new releases, just update the version, url, and sha256.

7) Documentation and promotion

Update your README.md with:

```markdown
## Installation

### Quick install (macOS/Linux)

```bash
curl -fsSL https://fenn.dev/install | sh
```

### Using Homebrew (macOS)

```bash
brew tap YOUR_ORG/fenn
brew install fenn
```

### Manual download

Download prebuilt binaries from [GitHub Releases](https://github.com/YOUR_ORG/fenn/releases).

### From source

```bash
git clone https://github.com/YOUR_ORG/fenn.git
cd fenn
pip install -e .
```
```

8) Testing the full flow

Before announcing:

1. Create a test tag: git tag v0.0.1-test && git push origin v0.0.1-test
2. Wait for CI to build
3. Download each binary and test on real systems
4. If all work, create real v0.1.0

9) Maintenance

When you release new versions:

1. Update version in your code
2. Create a new tag: git tag v0.1.1 && git push origin v0.1.1
3. CI builds and releases automatically
4. Update homebrew formula (if using)
5. Users can curl the install script again or brew upgrade

That's it! You now have:

✅ curl https://fenn.dev/install | sh installer
✅ Prebuilt binaries for macOS, Linux, Windows
✅ GitHub Releases automation
✅ Optional Homebrew tap
✅ Professional install UX, zero Python required for users

Ship it! 🚀