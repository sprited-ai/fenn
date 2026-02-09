# Fenn Frontend v0.1: A New Beginning


## Phase 1

### Scope

- [ ] We have the logo in public/fenn-logo.svg.
- [ ] Description of the product
- [ ] Nice HTML title 

### Design

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌──────┬──────────────────────────────────────────────────────────────┐    │
│   │      │                                               ┌────────────┐ │    │
│   │ Logo │                                               │  Download  │ │    │
│   │      │                                               └────────────┘ │    │
│   └──────┴──────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │ What is Fenn?                                                       │    │
│   │                                                                     │    │
│   │ Fenn is a command-line tool that lets you securely download and     │    │
│   │ organize your personal financial data across connected accounts.    │    │
│   │                                                                     │    │
│   │ It is designed for local-first data ownership — reports and         │    │
│   │ portfolio insights are generated on your machine, not in the cloud. │    │
│   │                                                                     │    │
│   │ Fenn requests read-only access through secure connection providers. │    │
│   │ No banking credentials are stored by Fenn.                          │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │ How it works                                                        │    │
│   │                                                                     │    │
│   │ • You install the Fenn CLI locally                                  │    │
│   │ • Accounts are connected via a secure provider flow                 │    │
│   │ • Financial data is synced and stored locally                       │    │
│   │ • Reports are generated entirely on your device                     │    │
│   │                                                                     │    │
│   │ Fenn stores only the minimum metadata required for authentication   │    │
│   │ and connection management. Portfolio data remains local by default. │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │ Invite Only                                                         │    │
│   │                                                                     │    │
│   │ Fenn is currently in invite-only preview.                           │    │
│   │                                                                     │    │
│   │ Reviewers or institutions evaluating the product may request        │    │
│   │ access by contacting:                                               │    │
│   │                                                                     │    │
│   │ support@sprited.app                                                 │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                                                              │
│   Sprited • All rights reserved | Terms | Privacy | Support                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Look and Feel

> "Quiet Technical Minimalism with Spirit Accent"

Finance + CLI + trust = neutral palette.

For UI pieces, we will use Radix UI.

### Related Files

- `ui/src/App.tsx`
- `ui/src/global.css`
- `ui/index.html`
- `ui/worker/index.ts`
- `legal/terms.md`
- `legal/privacy.md`

