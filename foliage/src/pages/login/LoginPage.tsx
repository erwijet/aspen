import TopBar from "@/shared/TopBar";
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Box,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { useUserStore, helpers as userHelpers } from "@/shared/user";

const LoginPage = () => {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const nav = useNavigate();
  const authClient = useUserStore.use.client();

  async function login() {
    const { username, password } = form.values;
    const { authority } = await authClient.log_in({ username, password });

    if (!authority) {
      form.setFieldError("username", "Invalid username or password");
      form.setFieldError("password", "Invalid username or password");
      return;
    }

    userHelpers.initWithJwt(authority.jwt);
    return nav("/console");
  }

  return (
    <Box>
      <TopBar />
      <Container size={420} my={40}>
        <Title
          align="center"
          sx={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            fontWeight: 900,
          })}
        >
          Welcome back to Aspen!
        </Title>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Do not have an account yet?{" "}
          <Anchor href="/register">Create account</Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Form onSubmit={() => login()} form={form}>
            <TextInput
              label="Username"
              placeholder="treelover9"
              required
              {...form.getInputProps("username")}
            />

            <PasswordInput
              label="Password"
              placeholder="hunter2"
              required
              mt="md"
              {...form.getInputProps("password")}
            />
            <Button fullWidth mt="xl" type="submit">
              Sign in
            </Button>
          </Form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
