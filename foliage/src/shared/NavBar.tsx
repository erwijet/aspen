import Logo from "@/../assets/brand.png";
import {
  Button,
  Group,
  Header,
  Title,
  Avatar,
  Popover,
  Menu,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSession } from "./auth";
import { IconLogout, IconSettings } from "@tabler/icons-react";

const NavBar = () => {
  const navigate = useNavigate();
  const session = useSession();

  function logout() {
    localStorage.removeItem("app.aspn.authority");
    navigate("/login");
  }

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: "100%" }}>
        <Group align={"center"}>
          <img src={Logo} height="32" />
          <Title sx={{ fontSize: "25px" }}>Aspen</Title>
        </Group>

        {session.authed ? (
          <Menu width={200} shadow={"md"}>
            <Menu.Target>
              <UnstyledButton>
                <Avatar style={{ cursor: "pointer" }}>
                  {session.firstname[0] + session.lastname[0]}
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

export default NavBar;
