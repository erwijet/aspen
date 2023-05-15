import {
  Button,
  Container,
  Flex,
  MultiSelect,
  Space,
  TextInput,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Authority, Link } from "trunk-proto/trunk";
import { useLinksClient } from "../clients/links";

const LinkDetail = (props: {
  value: Omit<Link, "id">;
  onChange: (link: Omit<Link, "id">) => void;
}) => {
  const links = useLinksClient();
  const [allUserKeywords, setAllUserKeywords] = useState<string[]>([]);

  return (
    <Flex p={8} direction={'column'} gap="sm">
      <TextInput
        label="Name"
        title="Link Name"
        placeholder="Name"
        value={props.value.name}
        onChange={(e) =>
          props.onChange({ ...props.value, name: e.target.value })
        }
      />
      <TextInput
        label="Link to"
        title="The target link as a fully qualified URL"
        value={props.value.url}
        placeholder="https://example.com"
        onChange={(e) =>
          props.onChange({ ...props.value, url: e.target.value })
        }
      />
      <MultiSelect
        searchable
        creatable
        label="Keywords"
        data={allUserKeywords}
        getCreateLabel={(keyword) => `New Keyword "${keyword}"`}
        onCreate={(query) => {
          props.onChange({
            ...props.value,
            keywords: props.value.keywords.concat([query]),
          });

          return query;
        }}
      />
      <Space h={16} />
    </Flex>
  );
};

export default LinkDetail;
