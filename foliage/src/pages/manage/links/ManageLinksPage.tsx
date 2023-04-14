import { useSession } from "@/shared/clients/auth";
import { useLinksClient } from "@/shared/clients/links";
import NavBar from "@/shared/NavBar";
import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Kbd,
  Space,
  Table,
  TextInput,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowRight,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "trunk-proto/trunk";
import { useHotkeys } from "@mantine/hooks";

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

    if (query == "")
      client.get_all({ authority: session.authority }).then(({ results }) => {
        setLinks(results);
        setLoading(false);
      });
    else
      client
        .search({ query, username: session.username })
        .then(({ results }) => {
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

  useEffect(() => {
    handleQuery(); // load all links on first load
  }, []);

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
          <Flex align="center" justify="space-between">
            <Flex align="center" gap={16}>
              <Title>Manage Links</Title>
              <Button leftIcon={<IconPlus size="1.1rem" />} variant="gradient">
                New
              </Button>
            </Flex>
            <TextInput
              icon={<IconSearch size="1.1rem" stroke={1.5} />}
              radius="md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="md"
              ref={searchBarRef}
              rightSection={
                <Flex align="center" gap={8}>
                  <Kbd ml={5}>/</Kbd>
                  <ActionIcon
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
          </Flex>
        </form>

        <Space h={64} />

        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Links To</th>
              <th>Keywords</th>
            </tr>
          </thead>

          <tbody>
            {links.map((link) => (
              <tr key={link.id}>
                <td>{link.name}</td>
                <td>{link.url}</td>
                <td>
                  {link.keywords.map((kwd) => (
                    <Badge
                      key={kwd}
                      m={4}
                      pr={3}
                      rightSection={
                        <ActionIcon
                          size="xs"
                          color="blue"
                          radius="xl"
                          variant="transparent"
                        >
                          <IconX size={rem(10)} />
                        </ActionIcon>
                      }
                    >
                      {kwd}
                    </Badge>
                  ))}
                  <ActionIcon
                    display={"inline"}
                    size={"sm"}
                    color="gray"
                    radius="xl"
                    variant="transparent"
                  >
                    <IconPlus size={rem(10)} />
                  </ActionIcon>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default ManageLinksPage;
