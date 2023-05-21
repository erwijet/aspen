import { useLinksClient } from "@/shared/links";
import { getAuthority } from "@/shared/getAuthority";
import { helpers, useUserStore } from "@/shared/user";
import { Maybe, isNone, isSome } from "@bryx-inc/ts-utils";
import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Group,
  Kbd,
  Space,
  Table,
  TextInput,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import {
  IconArrowRight,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "trunk-proto/trunk";
import NewLinkModal from "./NewLinkModal";
import EditLinkModal from "./EditLinkModal";

const ManageLinksPage = () => {
  const nav = useNavigate();
  const username = useUserStore.use.username();
  const { client, removeKeyword } = useLinksClient();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<Maybe<string>>(null);

  const authority = getAuthority();

  async function handleQuery() {
    if (isNone(client) || isNone(authority)) return;
    setLoading(true);

    if (query == "")
      await client.get_all({ authority }).then(({ results }) => {
        setLinks(results);
        setLoading(false);
      });
    else
      await client.search({ query, username }).then(({ results }) => {
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
    <Group>
      <NewLinkModal
        opened={createLinkModalOpen}
        onClose={closeCreateLinkModal}
        onRefresh={async () => {
          await handleQuery();
          await helpers.refreshUserKeywords();
        }}
      />
      <EditLinkModal 
         linkId={selectedLinkId ?? ""}
         opened={isSome(selectedLinkId)}
         onClose={(() => setSelectedLinkId(null))}
         onRefresh={async () => {
          await handleQuery();
          await helpers.refreshUserKeywords();
         }}
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
                onClick={() => setSelectedLinkId(link.id)}
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
    </Group>
  );
};

export default ManageLinksPage;
