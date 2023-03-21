import NavBar from "@/shared/NavBar";
import { useAuthClient } from "@/shared/auth";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Box,
} from "@mantine/core";
import { Form, useForm, zodResolver } from "@mantine/form";
import { m } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });

  const auth = useAuthClient();
  const nav = useNavigate();

  async function login() {
    if (!auth.ready) return;
    const { username, password } = form.values;

    const { authority } = await auth.client.log_in({ username, password });
    if (authority) {
      localStorage.setItem("app.aspn.authority", authority.jwt);
      nav("/console");
      return;
    }

    form.setFieldError("username", "Invalid username or password");
    form.setFieldError("password", "Invalid username or password");
  }

  return (
    <Box>
      <NavBar />
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
