import { useLinksClient } from "@/shared/links";
import { getAuthority } from "@/shared/getAuthority";
import LinkDetail from "@/pages/links/LinkDetail";
import { isNone } from "@bryx-inc/ts-utils";
import { Modal, Title, Flex, Button } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "trunk-proto/trunk";

const NewLinkModal = (props: {
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
  const { client } = useLinksClient();

  async function handleCreate() {
    if (isNone(client) || isNone(authority)) return;
    const { name, keywords, url } = draft;

    await client.create({
      authority,
      name,
      keywords,
      url,
    });

    props.onRefresh();
    props.onClose();
  }

  return (
    <Modal
      centered
      styles={{ inner: { padding: '0px!important' } }}
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

export default NewLinkModal;