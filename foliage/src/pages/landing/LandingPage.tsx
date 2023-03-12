import { Box } from "@mantine/core";

import Hero from "@/pages/landing/Hero";
import NavBar from "@/shared/NavBar";

const LandingPage = () => {
  return (
    <Box pb={120}>
      <NavBar />
      <Hero />
    </Box>
  );
};

export default LandingPage;
