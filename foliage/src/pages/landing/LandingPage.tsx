import Logo from "@/../assets/aspen.png";
import { Box, Button, Group, Header } from "@mantine/core";

import Hero from "@/pages/landing/Hero";

const LandingPage = () => {
  return (
    <Box pb={120}>
      <Header height={60} px="md">
        <Group position="apart" sx={{ height: "100%" }}>
          <img src={Logo} height="32" />

          <Group>
            <Button variant="default">Log in</Button>
            <Button>Sign up</Button>
          </Group>
        </Group>
      </Header>

      <Hero />
    </Box>
  );
};

export default LandingPage;
