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
            paddingBottom: "48px",
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
              Fenn is a command-line tool that lets you securely download and
              organize your personal financial data across connected accounts.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              It is designed for local-first data ownership — reports and
              portfolio insights are generated on your machine, not in the cloud.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
              Fenn requests read-only access through secure connection providers.
              No banking credentials are stored by Fenn.
            </Text>
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
            <Flex direction="column" gap="2">
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • You install the Fenn CLI locally
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Accounts are connected via a secure provider flow
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Financial data is synced and stored locally
              </Text>
              <Text as="p" size="3" css={{ lineHeight: "1.7" }}>
                • Reports are generated entirely on your device
              </Text>
            </Flex>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginTop: "16px" }}>
              Fenn stores only the minimum metadata required for authentication
              and connection management. Portfolio data remains local by default.
            </Text>
          </Box>

          {/* Invite Only */}
          <Box 
            css={{ 
              padding: "32px",
              border: "1px solid var(--gray-a5)",
              borderRadius: "8px",
              backgroundColor: "var(--gray-a2)"
            }}
          >
            <Heading size="5" mb="4">Invite Only</Heading>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Fenn is currently in invite-only preview.
            </Text>
            <Text as="p" size="3" css={{ lineHeight: "1.7", marginBottom: "12px" }}>
              Reviewers or institutions evaluating the product may request
              access by contacting:
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
