import Logo from "@/../assets/brand.png";
import {
  Button,
  Group,
  Header,
  Title,
  Avatar,
  Menu,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { useUserStore, helpers as userHelpers } from "./user";
import { getAuthority } from "./getAuthority";

const TopBar = () => {
  const authed = !!getAuthority();

  const firstName = useUserStore.use.firstName();
  const lastName = useUserStore.use.lastName();

  const nav = useNavigate();

  function logout() {
    userHelpers.logout();
    nav("/login");
  }

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: "100%" }}>
        <Group
          onClick={() => nav("/landing")}
          style={{ cursor: "pointer" }}
          align={"center"}
        >
          <img src={Logo} height="32" />
          <Title sx={{ fontSize: "25px" }}>Aspen</Title>
        </Group>

        {authed ? (
          <Menu width={200} shadow={"md"}>
            <Menu.Target>
              <UnstyledButton>
                <Avatar style={{ cursor: "pointer" }}>
                  {firstName[0] + lastName[0]}
                </Avatar>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                icon={<IconLogout size={14} />}
                onClick={() => logout()}
              >
                <UnstyledButton>Logout</UnstyledButton>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group>
            <Button variant="default" onClick={() => nav("/login")}>
              Log in
            </Button>

            <Button onClick={() => nav("/register")}>Sign Up</Button>
          </Group>
        )}
      </Group>
    </Header>
  );
};

export default TopBar;
