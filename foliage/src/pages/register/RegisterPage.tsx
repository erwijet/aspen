import TopBar from "@/shared/TopBar";
import { useUserStore } from "@/shared/user";
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
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      passwordConf: "",
    },
    validate: {
      firstName: (value) => (value == "" ? "This field is required" : null),
      lastName: (value) => (value == "" ? "This field is required" : null),
      passwordConf: (value, { password }) =>
        value == password ? null : "Passwords must match",
    },
    validateInputOnChange: true,
  });

  const authClient = useUserStore.use.client();
  const nav = useNavigate();

  useEffect(() => {
    const { username } = form.values;
    if (!username) return;

    authClient.is_username_taken({ username }).then(({ taken }) => {
      if (taken)
        form.setFieldError("username", "That username is already taken!");
    });
  }, [form.values.username]);

  async function register() {
    if (Object.values(form.errors).length > 0) return;

    setLoading(true);

    const { username, password, firstName, lastName } = form.values;

    const res = await authClient.create_account({
      username,
      password,
      firstName,
      lastName,
    });

    if (!res.authority || !res.authority.jwt)
      alert("failed to create account!");
    localStorage.setItem("app.aspn.authority", res.authority!.jwt);

    nav("/console");
  }

  return (
    <Box>
      <Container size={420} my={40}>
        <Title
          align="center"
          sx={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            fontWeight: 900,
          })}
        >
          Welcome to Aspen!
        </Title>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Already have an account? <Anchor href="/login">Log in</Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            label="Pick a Username"
            placeholder="treelover9"
            required
            {...form.getInputProps("username")}
          />

          <Flex gap={8} mt="md">
            <TextInput
              label={"First Name"}
              placeholder={"David"}
              required
              {...form.getInputProps("firstName")}
            />

            <TextInput
              label={"Last Name"}
              placeholder={"Bignelli"}
              required
              {...form.getInputProps("lastName")}
            />
          </Flex>

          <PasswordInput
            label="Password"
            placeholder="hunter2"
            required
            mt="md"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="hunter2"
            required
            mt="md"
            {...form.getInputProps("passwordConf")}
          />

          <Button
            disabled={
              Object.values(form.values).some((v) => v == "") ||
              Object.values(form.errors).length != 0
            }
            fullWidth
            loading={loading}
            mt="xl"
            onClick={() => {
              Object.keys(form.values)
                .filter((k) => k != "username")
                .forEach(form.validateField);
              register();
            }}
          >
            Blastoff 🚀
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
