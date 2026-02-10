# Security & Trust

## Binary Distribution

**macOS Users:** We recommend installing via Homebrew, which handles security transparently:
```bash
brew tap sprited-ai/fenn
brew install fenn
```

Homebrew is a trusted source on macOS and won't trigger security warnings.

**Direct Downloads:** Binaries are currently **not code-signed**. This is common for open-source tools. 

**Why no code signing?**
- Apple Developer Program costs $99/year
- Many respected OSS tools (Homebrew itself!) started without signing
- Our transparent build process provides integrity verification

**macOS Security Note**: When downloading directly, macOS may show a warning. The curl installer handles this automatically, or you can manually approve via: `xattr -d com.apple.quarantine fenn`

## Data Security

### Credentials Storage

- API keys are stored securely in local `.env` file
- Never transmitted except to authorized API endpoints
- Encrypted connections (HTTPS/TLS) for all API calls
- Credentials never logged or stored in plain text

### SnapTrade Integration

Fenn uses [SnapTrade](https://snaptrade.com) for secure brokerage connections:

- **OAuth-based authentication** - No passwords stored
- **Read-only access** - Cannot execute trades or withdraw funds
- **Encrypted API** - All data transmitted over TLS
- **Compliant** - SnapTrade is SOC 2 Type II certified

### Local Data

- Portfolio data stored locally in `data/portfolio.json`
- No cloud storage - your data stays on your machine
- No telemetry or usage tracking
- No third-party analytics

## Build Transparency

- **Open Source**: All code is public at https://github.com/sprited-ai/fenn
- **Reproducible Builds**: GitHub Actions builds are public and auditable
- **No Hidden Dependencies**: All dependencies declared in `requirements.txt`
- **Supply Chain**: Dependencies verified via SHA256 checksums

## Audit Trail

Every release:
1. Built on GitHub's infrastructure (not developer machines)
2. Signed with Apple Developer ID
3. Notarized by Apple (malware scan)
4. Source code tagged and immutable
5. Build logs publicly accessible

## Verification

### Verify Binary Signature (macOS)
```bash
codesign --verify --deep --verbose fenn
codesign -dv fenn
```

### Verify Notarization
```bash
spctl -a -vv fenn
```

Expected output: `source=Notarized Developer ID`

### Check SHA256 Checksum
Download checksums from GitHub Release and verify:
```bash
shasum -a 256 fenn
```

## Reporting Security Issues

Email: security@yourcompany.com (replace with your email)

We take security seriously and will respond within 24 hours.

## Compliance

- **No PII Collection**: Fenn does not collect personally identifiable information
- **GDPR Compliant**: No data transmission to third parties (except SnapTrade API)
- **Financial Data**: Handled according to industry best practices
- **Regular Updates**: Security patches applied promptly

---

Last updated: February 2026
