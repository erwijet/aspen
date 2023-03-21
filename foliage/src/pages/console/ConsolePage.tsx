import { useSession } from "@/shared/auth";
import { useLinksClient } from "@/shared/links";
import NavBar from "@/shared/NavBar";
import {
  ActionIcon,
  Container,
  JsonInput,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "trunk-proto/trunk";

const ConsolePage = () => {
  const nav = useNavigate();
  const session = useSession();
  const { ready, client } = useLinksClient();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  function handleQuery() {
    if (!ready || !session.authed) return;
    setLoading(true);
    client.search({ query, username: session.username }).then(({ results }) => {
      setLinks(results);
      setLoading(false);
    });
  }

  const theme = useMantineTheme();

  if (!session.authed) {
    nav("/login");
    return <></>;
  }

  return (
    <>
      <NavBar />
      <Container size={"lg"} my={40}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
        >
          <TextInput
            icon={<IconSearch size="1.1rem" stroke={1.5} />}
            radius="md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="md"
            left={'https://api.aspn.app/search/username?q='}
            rightSection={
              <ActionIcon
                disabled={query == ''}
                type="submit"
                size={32}
                radius="md"
                color={theme.primaryColor}
                loading={loading}
                variant="filled"
              >
                <IconArrowRight size="1.1rem" stroke={1.5} />
              </ActionIcon>
            }
            placeholder="Search links by keyword..."
            rightSectionWidth={42}
          />
        </form>

        <JsonInput
          mt={42}
          label="Aspen Query Response"
          autosize
          value={JSON.stringify({ links }, null, 2)}
        />
      </Container>
    </>
  );
};

export default ConsolePage;
