import {
  Button,
  Container,
  Flex,
  MultiSelect,
  Space,
  TextInput,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "trunk-proto/trunk";

const LinkDetail = (props: {
  value: Omit<Link, "id">;
  onChange: (link: Omit<Link, "id">) => void;
}) => {
  return (
    <Container p={8}>
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
          props.onChange({ ...props.value, name: e.target.value })
        }
      />
      <MultiSelect
        label="Keywords"
        data={props.value.keywords}
        creatable
        onCreate={(query) => {
          props.onChange({
            ...props.value,
            keywords: props.value.keywords.concat([query]),
          });

          return props.value.keywords;
        }}
      />
      <Space h={16} />
      <Flex justify={"flex-end"}>
        <Button leftIcon={<IconCheck size="1.1rem" />}>Create</Button>
      </Flex>
    </Container>
  );
};

export default LinkDetail;
