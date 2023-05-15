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
  const navigate = useNavigate();
  const authed = !!getAuthority();

  const firstName = useUserStore.use.firstName();
  const lastName = useUserStore.use.lastName();

  function logout() {
    userHelpers.logout();
    navigate("/login");
  }

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: "100%" }}>
        <Group align={"center"}>
          <a href="/landing">
            <img src={Logo} height="32" />
          </a>
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
              <Menu.Item type="button" icon={<IconSettings size={14} />}>
                <UnstyledButton>Settings</UnstyledButton>
              </Menu.Item>
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
            <Button variant="default" onClick={() => navigate("/login")}>
              Log in
            </Button>

            <Button onClick={() => navigate("/register")}>Sign Up</Button>
          </Group>
        )}
      </Group>
    </Header>
  );
};

export default TopBar;
