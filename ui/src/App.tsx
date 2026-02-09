import { css } from "@emotion/react";
import { Theme } from "@radix-ui/themes";

export default function App() {

  return (
    <Theme
      // appearance="dark"
      css={{
        minHeight: "100%",
        maxHeight: "100%",
        height: "100%",
        // height: "100vh",
        // "&": { height: "100dvh" },
        display: "flex",
        flexDirection: "column"
      }}
    >
      Fenn: Hello!
    </Theme>
  );
}
