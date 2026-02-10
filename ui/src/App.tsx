import { Theme, Container, Flex, Box, Heading, Text, Button, Link, Card, Code } from "@radix-ui/themes";
import { DownloadIcon } from "@radix-ui/react-icons";
import { TERMS_URL, PRIVACY_URL } from "./legal-urls";

export default function App() {
  return (
    <Theme
      accentColor="gray"
      grayColor="slate"
      radius="full"
      css={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        "--accent-9": "#3a334a",
        "--accent-10": "#2f2938",
        "--accent-11": "#1f1b26"
      }}
    >
      <Container 
        size="4"
        css={{ 
          flex: 1,
          padding: "28px 20px 72px",
          maxWidth: "980px",
          margin: "0 auto"
        }}
      >
        {/* Top Bar */}
        <Flex 
          justify="between" 
          align="center" 
          gap="4"
          css={{ 
            paddingBottom: "26px",
            paddingTop: "10px"
          }}
        >
          <Flex align="center" gap="3">
            <img 
              src="/fenn-logo-2.png" 
              alt="Fenn" 
              style={{ height: "48px", width: "auto" }} 
            />
            <h1>Fenn</h1>
          </Flex>
          <Button size="2" variant="solid">
            <DownloadIcon />
            Download
          </Button>
        </Flex>

        {/* Hero Section */}
        <Box css={{ paddingTop: "34px", paddingBottom: "18px" }}>
          <Box css={{ 
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "26px",
            alignItems: "start",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr"
            }
          }}>
            <Box>
              <Heading 
                css={{ 
                  fontSize: "46px",
                  lineHeight: "1.06",
                  letterSpacing: "-0.9px",
                  marginBottom: "10px",
                  fontWeight: "700",
                  "@media (max-width: 900px)": {
                    fontSize: "38px"
                  }
                }}
              >
                A financial tool that runs on your machine.
              </Heading>
              <Text 
                css={{ 
                  display: "block",
                  marginBottom: "18px",
                  color: "var(--gray-11)",
                  fontSize: "16px",
                  lineHeight: "1.65",
                  maxWidth: "62ch"
                }}
              >
                Fenn securely retrieves and organizes your personal financial data across connected institutions —
                while keeping that data under your control.
              </Text>
              <Flex gap="2" css={{ marginTop: "10px", flexWrap: "wrap" }}>
                <Button size="3" variant="solid">Get Fenn</Button>
                <Button size="3" variant="outline">Read setup</Button>
              </Flex>
              <Text 
                css={{ 
                  display: "block",
                  marginTop: "14px",
                  color: "var(--gray-11)",
                  fontSize: "12px"
                }}
              >
                <strong>Note:</strong> Fenn is not affiliated with or endorsed by Fidelity, Chase, Wells Fargo, or other institutions.
              </Text>
            </Box>

            {/* Quickstart Card */}
            <Card 
              css={{ 
                backgroundColor: "rgba(251, 251, 253, 0.9)",
                boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)"
              }}
            >
              <Flex justify="between" align="center" css={{ marginBottom: "12px" }}>
                <Flex align="center" gap="2">
                  <Box 
                    css={{ 
                      fontSize: "12px",
                      padding: "4px 10px",
                      border: "1px solid rgba(58,51,74,0.20)",
                      color: "var(--accent-9)",
                      borderRadius: "999px",
                      background: "rgba(58,51,74,0.06)",
                      fontWeight: "600"
                    }}
                  >
                    Quickstart
                  </Box>
                  <Text size="1" css={{ color: "var(--gray-11)" }}>
                    Install without Homebrew
                  </Text>
                </Flex>
              </Flex>
              <Box 
                css={{ 
                  padding: "14px",
                  background: "linear-gradient(180deg, rgba(58,51,74,0.03), rgba(58,51,74,0.00))",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  overflow: "auto"
                }}
              >
                <Code 
                  css={{ 
                    display: "block",
                    whiteSpace: "pre",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: "12.5px",
                    lineHeight: "1.6"
                  }}
                >
{`# Install pipx (recommended for Python CLIs)
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Install Fenn
pipx install fenn

# Connect + sync
fenn connect
fenn sync
fenn report --format html`}
                </Code>
              </Box>
              <Text css={{ fontSize: "12px", color: "var(--gray-11)", lineHeight: "1.55" }}>
                Prefer binaries? Ship signed downloads later via GitHub Releases (macOS / Windows / Linux).
              </Text>
            </Card>
          </Box>
        </Box>

        {/* Main Grid Sections */}
        <Box 
          css={{ 
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "22px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr"
            }
          }}
        >
          {/* What is Fenn */}
          <Card css={{ boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)" }}>
            <Heading 
              size="4"
              css={{ 
                marginBottom: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                letterSpacing: "0.2px"
              }}
            >
              <Box 
                css={{ 
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--accent-9)",
                  boxShadow: "0 6px 14px rgba(58,51,74,0.18)"
                }} 
              />
              What is Fenn?
            </Heading>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginBottom: "10px" }}>
              Fenn lets you securely retrieve and organize your personal financial data across connected institutions —
              while keeping that data under your control.
            </Text>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginBottom: "10px" }}>
              Unlike traditional cloud dashboards, Fenn operates on your device. Portfolio data is stored and processed locally,
              allowing you to generate reports, analyze trends, and maintain your financial history without relying on a centralized service.
            </Text>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginBottom: "10px" }}>
              Fenn connects through secure provider authorization flows using read-only access. Banking credentials are never requested or stored by Fenn.
            </Text>
            <Box 
              as="blockquote"
              css={{ 
                borderLeft: "2px solid rgba(58,51,74,0.35)",
                paddingLeft: "12px",
                margin: "12px 0 0",
                fontStyle: "italic",
                color: "#2a2a35"
              }}
            >
              <Text size="2">your financial data remains yours.</Text>
            </Box>
          </Card>

          {/* How it works */}
          <Card css={{ boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)" }}>
            <Heading 
              size="4"
              css={{ 
                marginBottom: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                letterSpacing: "0.2px"
              }}
            >
              <Box 
                css={{ 
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--accent-9)",
                  boxShadow: "0 6px 14px rgba(58,51,74,0.18)"
                }} 
              />
              How it works
            </Heading>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginBottom: "10px" }}>
              Fenn follows a device-managed workflow:
            </Text>
            <Box as="ul" css={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
              {[
                "Install Fenn on your computer",
                "Link accounts through secure authorization providers",
                "Sync financial data directly to your device",
                "Generate reports and insights locally"
              ].map((item, i) => (
                <Flex key={i} gap="2" css={{ margin: "8px 0" }}>
                  <Box 
                    css={{ 
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: "rgba(58,51,74,0.35)",
                      marginTop: "8px",
                      flexShrink: 0
                    }} 
                  />
                  <Text css={{ fontSize: "14px", color: "var(--gray-11)", lineHeight: "1.7" }}>{item}</Text>
                </Flex>
              ))}
            </Box>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginTop: "12px" }}>
              Fenn services retain only the minimal metadata necessary for authentication and connection management.
              Financial records remain stored on your machine by default.
            </Text>
          </Card>
        </Box>

        {/* Second Grid Row */}
        <Box 
          css={{ 
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "16px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr"
            }
          }}
        >
          {/* Security & Privacy */}
          <Card css={{ boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)" }}>
            <Heading 
              size="4"
              css={{ 
                marginBottom: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                letterSpacing: "0.2px"
              }}
            >
              <Box 
                css={{ 
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--accent-9)",
                  boxShadow: "0 6px 14px rgba(58,51,74,0.18)"
                }} 
              />
              Security & privacy
            </Heading>
            <Box as="ul" css={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
              {[
                "Read-only access via secure authorization flows",
                "No banking credentials stored by Fenn",
                "Local storage by default (you control your data)",
                "Disconnect any time"
              ].map((item, i) => (
                <Flex key={i} gap="2" css={{ margin: "8px 0" }}>
                  <Box 
                    css={{ 
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: "rgba(58,51,74,0.35)",
                      marginTop: "8px",
                      flexShrink: 0
                    }} 
                  />
                  <Text size="2" css={{ color: "var(--gray-11)", lineHeight: "1.7" }}>{item}</Text>
                </Flex>
              ))}
            </Box>
          </Card>

          {/* Setup */}
          <Card css={{ boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)" }}>
            <Heading 
              size="4"
              css={{ 
                marginBottom: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                letterSpacing: "0.2px"
              }}
            >
              <Box 
                css={{ 
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "var(--accent-9)",
                  boxShadow: "0 6px 14px rgba(58,51,74,0.18)"
                }} 
              />
              Setup
            </Heading>
            <Text as="p" size="2" css={{ color: "var(--gray-11)", lineHeight: "1.65", marginBottom: "10px" }}>
              If you're evaluating Fenn, start with the setup guide and connection requirements.
              You can keep this page minimal and link to a single "Get Started" doc.
            </Text>
            <Text as="p" size="2">
              <Link href="/get-started.html">Get Started →</Link>
            </Text>
          </Card>
        </Box>

        {/* Invite Section */}
        <Box 
          css={{ 
            marginTop: "16px",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid rgba(58,51,74,0.25)",
            background: "linear-gradient(180deg, rgba(58,51,74,0.08), rgba(58,51,74,0.03))",
            boxShadow: "0 10px 30px rgba(17, 17, 24, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap"
          }}
        >
          <Box css={{ maxWidth: "70ch" }}>
            <Text size="2" weight="bold" css={{ display: "block", marginBottom: "4px", letterSpacing: "0.2px" }}>
              Invite-only preview
            </Text>
            <Text size="2" css={{ color: "var(--gray-11)", lineHeight: "1.6" }}>
              Fenn is currently in controlled preview as we refine security, reliability, and institutional integrations.
              Reviewers or institutions evaluating the platform may request access.
            </Text>
          </Box>
          <Button size="2" variant="solid" asChild>
            <a href="mailto:support@sprited.app">Contact support@sprited.app</a>
          </Button>
        </Box>

        {/* Footer */}
        <Flex 
          justify="between" 
          align="center"
          gap="4"
          css={{ 
            marginTop: "40px",
            paddingTop: "18px",
            borderTop: "1px solid var(--gray-a5)",
            flexWrap: "wrap"
          }}
        >
          <Text size="1" css={{ color: "var(--gray-11)" }}>
            Sprited • All rights reserved
          </Text>
          <Flex gap="3" css={{ flexWrap: "wrap" }}>
            <Link href={TERMS_URL} size="1">Terms</Link>
            <Link href={PRIVACY_URL} size="1">Privacy</Link>
            <Link href="mailto:support@sprited.app" size="1">Support</Link>
          </Flex>
        </Flex>
      </Container>
    </Theme>
  );
}
