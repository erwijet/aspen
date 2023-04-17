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
  Modal,
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
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import LinkDetail from "@/shared/links/LinkDetail";

const NewLinkModal = (props: { opened: boolean; onClose: () => void }) => {
  const [draft, setDraft] = useState<Omit<Link, "id">>({
    name: "",
    url: "",
    keywords: [],
    hits: 0,
  });

  return (
    <Modal
      centered
      opened={props.opened}
      onClose={props.onClose}
      title={<Title size="h4">Create Link</Title>}
    >
      <LinkDetail value={draft} onChange={setDraft} />
    </Modal>
  );
};

const ManageLinksPage = () => {
  const nav = useNavigate();
  const session = useSession();
  const { ready, client, removeKeyword } = useLinksClient();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  function handleQuery() {
    if (!ready || !session.authed) return;
    setLoading(true);

    if (query == "")
      client
        .getOrThrow()
        .get_all({ authority: session.authority })
        .then(({ results }) => {
          setLinks(results);
          setLoading(false);
        });
    else
      client
        .getOrThrow()
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

  const [
    createLinkModalOpen,
    { open: openCreateLinkModal, close: closeCreateLinkModal },
  ] = useDisclosure();

  return (
    <>
      <NavBar />
      <NewLinkModal opened={createLinkModalOpen} onClose={closeCreateLinkModal} />
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
              <Button
                leftIcon={<IconPlus size="1.1rem" />}
                variant="gradient"
                onClick={() => openCreateLinkModal()}
              >
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
              <tr
                key={JSON.stringify(link)}
                tabIndex={0}
                onClick={() => alert(link.id)}
              >
                <td>{link.name}</td>
                <td>{link.url}</td>
                <td>
                  {link.keywords.map((kwd) => (
                    <Badge
                      key={kwd}
                      m={4}
                      pr={4}
                      rightSection={
                        link.keywords.length > 1 ? (
                          <ActionIcon
                            size="xs"
                            color="blue"
                            radius="xl"
                            variant="transparent"
                            onClick={(e) => {
                              e.stopPropagation(); // don't bubble up event to the rows click listener
                              removeKeyword(link, kwd); // remove the keyword via grpc

                              // optimistic update

                              setLinks(
                                links.map((e) => {
                                  if (e.id == link.id)
                                    return {
                                      ...e,
                                      keywords: e.keywords.filter(
                                        (e) => e != kwd
                                      ),
                                    };
                                  return e;
                                })
                              );
                            }}
                          >
                            <IconX size={rem(10)} />
                          </ActionIcon>
                        ) : (
                          <></>
                        )
                      }
                    >
                      {kwd}
                    </Badge>
                  ))}
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
