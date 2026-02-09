import { css } from "@emotion/react";
import { Theme, Container, Flex, Box, Heading, Text, Button, Link, Code } from "@radix-ui/themes";
import { DownloadIcon } from "@radix-ui/react-icons";
import { TERMS_URL, PRIVACY_URL } from "./legal-urls";

export default function App() {
  return (
    <Theme
      css={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Container 
        size="3" 
        css={{ 
          flex: 1,
          display: "flex", 
          flexDirection: "column",
          padding: "32px 24px"
        }}
      >
        {/* Header */}
        <Flex 
          justify="between" 
          align="center" 
          css={{ 
            paddingBottom: "32px"
          }}
        >
          <Flex align="center" gap="3">
            <img 
              src="/fenn-logo-horizontal.svg" 
              alt="Fenn" 
              style={{ height: "40px", width: "auto" }} 
            />
          </Flex>
          <Button size="3" variant="solid">
            <DownloadIcon />
            Download
          </Button>
        </Flex>

        {/* Hero Section */}
        <Flex 
          direction="column" 
          align="center" 
          css={{ 
            paddingTop: "80px",
            paddingBottom: "80px",
            textAlign: "center"
          }}
        >
          <Heading 
            size="8" 
            weight="bold" 
            css={{ 
              marginBottom: "24px",
              fontSize: "48px",
              lineHeight: "1.2"
            }}
          >
            A financial tool that runs on your machine.
          </Heading>
          <Box css={{ height: "2px", width: "60px", backgroundColor: "var(--accent-9)", marginBottom: "32px" }} />
          <Button size="4" variant="solid" css={{ paddingLeft: "32px", paddingRight: "32px" }}>
            <DownloadIcon />
            Download Fenn
          </Button>
        </Flex>

        {/* Main Content */}
        <Flex 
          direction="column" 
          css={{ 
            flex: 1,
            paddingTop: "64px",
            paddingBottom: "64px",
            gap: "96px"
          }}
        >
          {/* What is Fenn? */}
          <Box css={{ maxWidth: "720px", margin: "0 auto" }}>
            <Heading size="6" mb="5" css={{ fontWeight: "600" }}>What is Fenn?</Heading>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "20px", color: "var(--gray-12)" }}>
              Fenn lets you securely retrieve and organize your personal financial data across connected institutions — while keeping that data under your control.
            </Text>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "20px", color: "var(--gray-12)" }}>
              Unlike traditional cloud dashboards, Fenn operates on your device. Portfolio data is stored and processed locally, allowing you to generate reports, analyze trends, and maintain your financial history without relying on a centralized service.
            </Text>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "20px", color: "var(--gray-12)" }}>
              Fenn connects through secure provider authorization flows using read-only access. Banking credentials are never requested or stored by Fenn.
            </Text>
            <Box 
              as="blockquote" 
              css={{ 
                marginTop: "32px",
                paddingLeft: "24px",
                borderLeft: "3px solid var(--accent-9)",
                fontStyle: "italic"
              }}
            >
              <Text size="4" css={{ color: "var(--gray-11)" }}>
                your financial data remains yours.
              </Text>
            </Box>
          </Box>

          {/* How it works */}
          <Box 
            css={{ 
              maxWidth: "720px", 
              margin: "0 auto",
              padding: "48px",
              backgroundColor: "var(--gray-a2)",
              borderRadius: "8px"
            }}
          >
            <Heading size="6" mb="5" css={{ fontWeight: "600" }}>How it works</Heading>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "24px", color: "var(--gray-12)" }}>
              Fenn follows a device-managed workflow:
            </Text>
            <Flex direction="column" gap="3" css={{ marginBottom: "32px" }}>
              <Text as="p" size="4" css={{ lineHeight: "1.8" }}>
                • Install Fenn on your computer
              </Text>
              <Text as="p" size="4" css={{ lineHeight: "1.8" }}>
                • Link accounts through secure authorization providers
              </Text>
              <Text as="p" size="4" css={{ lineHeight: "1.8" }}>
                • Sync financial data directly to your device
              </Text>
              <Text as="p" size="4" css={{ lineHeight: "1.8" }}>
                • Generate reports and insights locally
              </Text>
            </Flex>
            <Box 
              css={{ 
                padding: "16px 20px",
                backgroundColor: "var(--gray-a3)",
                borderRadius: "6px",
                border: "1px solid var(--gray-a5)",
                marginBottom: "24px"
              }}
            >
              <Code size="3" css={{ fontFamily: "monospace", color: "var(--gray-12)" }}>
                $ fenn sync --provider snaptrade
              </Code>
            </Box>
            <Text as="p" size="3" css={{ lineHeight: "1.7", color: "var(--gray-11)" }}>
              Fenn services retain only the minimal metadata necessary for authentication and connection management. Financial records remain stored on your machine by default.
            </Text>
          </Box>

          {/* Invite-only preview */}
          <Box 
            css={{ 
              maxWidth: "720px",
              margin: "0 auto",
              padding: "48px",
              border: "1px solid var(--gray-a6)",
              borderRadius: "8px"
            }}
          >
            <Heading size="6" mb="4" css={{ fontWeight: "600" }}>Invite-only preview</Heading>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "20px", color: "var(--gray-12)" }}>
              Fenn is currently in controlled preview as we refine security, reliability, and institutional integrations.
            </Text>
            <Text as="p" size="4" css={{ lineHeight: "1.8", marginBottom: "20px", color: "var(--gray-12)" }}>
              Reviewers or institutions evaluating the platform may request access by contacting:
            </Text>
            <Link href="mailto:support@sprited.app" size="4" weight="medium">
              support@sprited.app
            </Link>
          </Box>
        </Flex>

        {/* Footer */}
        <Flex 
          justify="between" 
          align="center"
          css={{ 
            paddingTop: "48px",
            borderTop: "1px solid var(--gray-a5)",
            marginTop: "64px"
          }}
        >
          <Text size="2" css={{ color: "var(--gray-11)" }}>
            Sprited • All rights reserved
          </Text>
          <Flex gap="4">
            <Link href={TERMS_URL} size="2" css={{ color: "var(--gray-11)" }}>Terms</Link>
            <Link href={PRIVACY_URL} size="2" css={{ color: "var(--gray-11)" }}>Privacy</Link>
            <Link href="mailto:support@sprited.app" size="2" css={{ color: "var(--gray-11)" }}>Support</Link>
          </Flex>
        </Flex>
      </Container>
    </Theme>
  );
}
