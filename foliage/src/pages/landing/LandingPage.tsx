import { Box } from "@mantine/core";

import Hero from "@/pages/landing/Hero";
import TopBar from "@/shared/TopBar";

const LandingPage = () => {
  return (
    <Box pb={120}>
      <TopBar />
      <Hero />
    </Box>
  );
};

export default LandingPage;
