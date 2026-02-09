import { css } from "@emotion/react";
import { Theme, Container, Flex, Box, Heading, Text, Button, Link } from "@radix-ui/themes";
import { DownloadIcon } from "@radix-ui/react-icons";

export default function App() {
  return (
    <Theme
      css={{
        minHeight: "100%",
        maxHeight: "100%",
        height: "100%",
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
          padding: "24px"
        }}
      >
        {/* Header */}
        <Flex 
          justify="between" 
          align="center" 
          css={{ 
            paddingBottom: "24px",
            borderBottom: "1px solid var(--gray-a5)"
          }}
        >
          <Flex align="center" gap="3">
            <img 
              src="/fenn-logo.svg" 
              alt="Fenn" 
              style={{ height: "48px", width: "auto" }} 
            />
          </Flex>
          <Button size="3" variant="solid">
            <DownloadIcon />
            Download
          </Button>
        </Flex>

        {/* Tagline */}
        <Box css={{ paddingTop: "24px", paddingBottom: "24px" }}>
          <Text size="5" weight="medium" css={{ color: "var(--gray-12)" }}>
            A financial tool that runs on your machine.
          </Text>
        </Box>

        {/* Main Content */}
        <Flex 
          direction="column" 
          gap="6" 
          css={{ 
            flex: 1,
            paddingTop: "48px",
            paddingBottom: "48px"
          }}
        >
          {/* What is Fenn? */}
          <Box 
            css={{ 
              padding: "32px",
              border: "1px solid var(--gray-a5)",
              borderRadius: "8px",
              backgroundColor: "var(--gray-a2)"
            }}
          >
            <Heading size="5" mb="4">What is Fenn?</Heading>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Fenn lets you securely retrieve and organize your personal financial data across connected institutions — while keeping that data under your control.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Unlike traditional cloud dashboards, Fenn operates on your device. Portfolio data is stored and processed locally, allowing you to generate reports, analyze trends, and maintain your financial history without relying on a centralized service.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Fenn connects through secure provider authorization flows using read-only access. Banking credentials are never requested or stored by Fenn.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              The guiding principle is simple:
            </Text>
            <Box 
              as="blockquote" 
              css={{ 
                marginLeft: "16px",
                paddingLeft: "16px",
                borderLeft: "3px solid var(--gray-a6)",
                fontStyle: "italic"
              }}
            >
              <Text size="3" css={{ color: "var(--gray-11)" }}>
                your financial data remains yours.
              </Text>
            </Box>
          </Box>

          {/* How it works */}
          <Box 
            css={{ 
              padding: "32px",
              border: "1px solid var(--gray-a5)",
              borderRadius: "8px",
              backgroundColor: "var(--gray-a2)"
            }}
          >
            <Heading size="5" mb="4">How it works</Heading>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Fenn follows a device-managed workflow:
            </Text>
            <Flex direction="column" gap="2">
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Install Fenn on your computer
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Link accounts through secure authorization providers
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Sync financial data directly to your device
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Generate reports and insights locally
              </Text>
            </Flex>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginTop: "16px" }}>
              Fenn services retain only the minimal metadata necessary for authentication and connection management. Financial records remain stored on your machine by default.
            </Text>
          </Box>

          {/* Invite-only preview */}
          <Box 
            css={{ 
              padding: "32px",
              border: "1px solid var(--gray-a5)",
              borderRadius: "8px",
              backgroundColor: "var(--gray-a2)"
            }}
          >
            <Heading size="5" mb="4">Invite-only preview</Heading>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Fenn is currently in controlled preview as we refine security, reliability, and institutional integrations.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Reviewers or institutions evaluating the platform may request access by contacting:
            </Text>
            <Link href="mailto:support@sprited.app" size="3" weight="medium">
              support@sprited.app
            </Link>
          </Box>
        </Flex>

        {/* Footer */}
        <Flex 
          justify="between" 
          align="center"
          css={{ 
            paddingTop: "24px",
            borderTop: "1px solid var(--gray-a5)",
            fontSize: "14px",
            color: "var(--gray-11)"
          }}
        >
          <Text size="2" css={{ color: "var(--gray-11)" }}>
            Sprited • All rights reserved
          </Text>
          <Flex gap="4">
            <Link href="/terms" size="2" css={{ color: "var(--gray-11)" }}>Terms</Link>
            <Link href="/privacy" size="2" css={{ color: "var(--gray-11)" }}>Privacy</Link>
            <Link href="mailto:support@sprited.app" size="2" css={{ color: "var(--gray-11)" }}>Support</Link>
          </Flex>
        </Flex>
      </Container>
    </Theme>
  );
}
