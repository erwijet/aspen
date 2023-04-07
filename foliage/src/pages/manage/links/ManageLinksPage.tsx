import { useSession } from "@/shared/auth";
import { useLinksClient } from "@/shared/links";
import NavBar from "@/shared/NavBar";
import {
  ActionIcon,
  Container,
  Flex,
  JsonInput,
  Kbd,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "trunk-proto/trunk";
import { useHotkeys, getHotkeyHandler } from "@mantine/hooks";

const ManageLinksPage = () => {
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
  const searchBarRef = useRef<HTMLInputElement>(null);

  useHotkeys([["/", () => searchBarRef.current?.focus()]]);

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
            ref={searchBarRef}
            left={"https://api.aspn.app/search/username?q="}
            rightSection={
              <Flex align="center" gap={8}>
                <Kbd ml={5}>/</Kbd>
                <ActionIcon
                  disabled={query == ""}
                  type="submit"
                  size={32}
                  radius="md"
                  color={theme.primaryColor}
                  loading={loading}
                  variant="filled"
                >
                  <IconArrowRight size="1.1rem" stroke={1.5} />
                </ActionIcon>
              </Flex>
            }
            placeholder="Search links by keyword..."
            rightSectionWidth={72}
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

export default ManageLinksPage;
