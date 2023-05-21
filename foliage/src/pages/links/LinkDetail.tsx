import { Flex, MultiSelect, Space, TextInput } from "@mantine/core";
import { Link } from "trunk-proto/trunk";
import { slicePropertyAtDeepKey } from "@bryx-inc/ts-utils";
import { useUserStore } from "../../shared/user";

const LinkDetail = (props: {
  value: Omit<Link, "id">;
  onChange: (link: Omit<Link, "id">) => void;
}) => {
  const allUserKeywords = useUserStore.use.keywords();

  return (
    <Flex p={8} direction={"column"} gap="sm">
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
          props.onChange(
            slicePropertyAtDeepKey(props.value, "url", e.target.value)
          )
        }
      />
      <MultiSelect
        searchable
        creatable
        label="Keywords"
        data={allUserKeywords.concat(props.value.keywords)}
        getCreateLabel={(keyword) => `New Keyword "${keyword}"`}
        value={props.value.keywords}
        onChange={(kwds) => {
          props.onChange(slicePropertyAtDeepKey(props.value, "keywords", kwds));
        }}
      />
      <Space h={16} />
    </Flex>
  );
};

export default LinkDetail;
