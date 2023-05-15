import { useLinksClient } from "@/shared/clients/links";
import TopBar from "@/shared/TopBar";
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
  IconCheck,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "trunk-proto/trunk";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import LinkDetail from "@/shared/links/LinkDetail";
import { useUserStore } from "@/shared/user";
import { getAuthority } from "@/shared/getAuthority";
import { SideBar } from "@/shared/SideBar";
import { isNone } from "@bryx-inc/ts-utils";

const NewLinkModal = (props: {
  opened: boolean;
  onClose: () => void;
  onRefreshRequested: () => void;
}) => {
  const [draft, setDraft] = useState<Omit<Link, "id">>({
    name: "",
    url: "",
    keywords: [],
    hits: 0,
  });

  const authority = getAuthority();
  const { ready, client } = useLinksClient();

  async function handleCreate() {
    if (!ready || isNone(authority)) return;
    const { name, keywords, url } = draft;

    await client.getOrThrow().create({
      authority,
      name,
      keywords,
      url,
    });

    props.onRefreshRequested();
    props.onClose();
  }

  return (
    <Modal
      centered
      opened={props.opened}
      onClose={props.onClose}
      title={<Title size="h4">Create Link</Title>}
    >
      <LinkDetail value={draft} onChange={setDraft} />
      <Flex justify={"flex-end"}>
        <Button
          leftIcon={<IconCheck size="1.1rem" />}
          onClick={() => handleCreate()}
        >
          Create
        </Button>
      </Flex>
    </Modal>
  );
};

const ManageLinksPage = () => {
  const nav = useNavigate();
  const username = useUserStore.use.username();
  const { ready, client, removeKeyword } = useLinksClient();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);

  const authority = getAuthority();

  function handleQuery() {
    if (!ready || !authority) return;
    setLoading(true);

    if (query == "")
      client
        .getOrThrow()
        .get_all({ authority })
        .then(({ results }) => {
          setLinks(results);
          setLoading(false);
        });
    else
      client
        .getOrThrow()
        .search({ query, username })
        .then(({ results }) => {
          setLinks(results);
          setLoading(false);
        });
  }

  const theme = useMantineTheme();
  const searchBarRef = useRef<HTMLInputElement>(null);

  useHotkeys([["/", () => searchBarRef.current?.focus()]]);

  useEffect(() => {
    handleQuery(); // load all links on first load
  }, []);

  const [
    createLinkModalOpen,
    { open: openCreateLinkModal, close: closeCreateLinkModal },
  ] = useDisclosure();

  useEffect(() => {
    if (authority == null) nav("/login");
  }, [authority]);

  return (
    <>
      <NewLinkModal
        opened={createLinkModalOpen}
        onClose={closeCreateLinkModal}
        onRefreshRequested={() => handleQuery()}
      />
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
