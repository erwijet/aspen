import Logo from "@/../assets/brand.png";
import { Button, Group, Header, Title, Avatar } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useSession } from "./auth";

const NavBar = () => {
  const navigate = useNavigate();
  const session = useSession();

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: "100%" }}>
        <Group align={"center"}>
          <img src={Logo} height="32" />
          <Title sx={{ fontSize: "25px" }}>Aspen</Title>
        </Group>

        {session.authed ? (
          <Avatar>{session.firstname[0] + session.lastname[0]}</Avatar>
        ) : (
          <Group>
            <Button variant="default" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button onClick={() => navigate("/register")}>Sign up</Button>
          </Group>
        )}
      </Group>
    </Header>
  );
};

export default NavBar;
