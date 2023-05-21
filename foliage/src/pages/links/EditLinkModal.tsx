import { useLinksClient } from "@/shared/links";
import { getAuthority } from "@/shared/getAuthority";
import LinkDetail from "@/pages/links/LinkDetail";
import { FormalMaybe, intoMaybe, isNone, throwError } from "@bryx-inc/ts-utils";
import {
  Modal,
  Title,
  Flex,
  Button,
  Loader,
  LoadingOverlay,
} from "@mantine/core";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "trunk-proto/trunk";

const EditLinkModal = ({
  linkId,
  opened,
  onClose,
  onRefresh: onRefreshRequested,
}: {
  linkId: string;
  opened: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const [draft, setDraft] = useState<Omit<Link, "id">>({
    name: "",
    url: "",
    keywords: [],
    hits: 0,
  });

  const authority = getAuthority();
  const client = useLinksClient.use.client();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opened) setLoading(true);
  }, [opened]);

  useEffect(() => {
    if (isNone(client) || isNone(linkId) || isNone(authority)) return;
    setLoading(true);

    client.get({ authority, linkId }).then(({ result }) => {
      if (!result)
        return throwError(
          new Error(`No response for link query with id "${linkId}"`)
        );

      setDraft(result);
      setLoading(false);
    });
  }, [client, linkId]);

  async function handleEdit() {
    if (isNone(client) || isNone(authority)) return;
    const { name, keywords, url } = draft;

    await client.update({ 
      authority,
      linkId,
      update: {
        name,
        url,
        keywords
      }
    });

    onRefreshRequested();
    onClose();
  }

  async function handleDelete() {
    if (isNone(client) || isNone(authority)) return;
    await client.delete({ authority, linkId });

    onRefreshRequested();
    onClose();
  }

  return (
    <Modal
      centered
      styles={{ inner: { padding: '0px!important' } }}
      opened={opened}
      onClose={onClose}
      title={<Title size="h4">Edit Link</Title>}
    >
      <LoadingOverlay visible={loading} />
      <LinkDetail value={draft} onChange={setDraft} />
      <Flex justify={"flex-end"} gap={8}>
        <Button
          variant="outline"
          color="red"
          leftIcon={<IconTrash size="1.1rem" />}
          onClick={() => handleDelete()}
        >
          Delete
        </Button>
        <Button
          leftIcon={<IconCheck size="1.1rem" />}
          onClick={() => handleEdit()}
        >
          Done
        </Button>
      </Flex>
    </Modal>
  );
};

export default EditLinkModal;
