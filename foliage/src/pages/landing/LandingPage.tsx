import { Box } from "@mantine/core";

import Hero from "@/pages/landing/Hero";
import TopBar from "@/shared/TopBar";
import { getAuthority } from "@/shared/getAuthority";
import { isSome, pipe, useWaitFor } from "@bryx-inc/ts-utils";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const userIsAuthed = pipe(getAuthority(), isSome);
  const nav = useNavigate();

  useWaitFor(() => nav("/links"), userIsAuthed);

  return (
    <Box pb={120}>
      <TopBar />
      <Hero />
    </Box>
  );
};

export default LandingPage;
