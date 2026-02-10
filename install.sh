#!/usr/bin/env bash
set -euo pipefail

# Fenn installer for macOS
# Recommended: brew tap sprited-ai/fenn && brew install fenn

REPO="sprited-ai/fenn"
VERSION="${1:-latest}"

# Check macOS
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "❌ Fenn is macOS only."
  echo ""
  echo "Please use Homebrew:"
  echo "  brew tap sprited-ai/fenn"
  echo "  brew install fenn"
  exit 1
fi

if [[ "$VERSION" == "latest" ]]; then
  TAG="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep -m1 '"tag_name"' | cut -d'"' -f4)"
else
  TAG="$VERSION"
fi

ASSET="fenn-${TAG}-macos.tar.gz"
URL="https://github.com/$REPO/releases/download/$TAG/$ASSET"

INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

echo "Downloading fenn $TAG for macOS..."
curl -fsSL "$URL" -o /tmp/fenn.tar.gz

echo "Installing to $INSTALL_DIR..."
tar -xzf /tmp/fenn.tar.gz -C /tmp
mv /tmp/fenn "$INSTALL_DIR/fenn"
chmod +x "$INSTALL_DIR/fenn"

# Remove macOS quarantine flag to avoid Gatekeeper warning
xattr -d com.apple.quarantine "$INSTALL_DIR/fenn" 2>/dev/null || true

rm /tmp/fenn.tar.gz

echo ""
echo "✅ fenn installed to $INSTALL_DIR/fenn"
echo ""
echo "Make sure $INSTALL_DIR is in your PATH."
echo "Add this to your ~/.zshrc:"
echo ""
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
echo ""
echo "Then run: source ~/.zshrc"
