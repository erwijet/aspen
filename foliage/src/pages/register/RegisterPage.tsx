import NavBar from "@/shared/NavBar";
import { useAuth } from "@/useAuth";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Box,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { m } from "framer-motion";
import { useEffect } from "react";

const RegisterPage = () => {
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

  const auth = useAuth();

  useEffect(() => {
    const { username } = form.values;
    if (!auth.ready || !username) return;

    auth.client.is_username_taken({ username }).then(({ taken }) => {
      if (taken)
        form.setFieldError("username", "That username is already taken!");
    });
  }, [form.values.username]);

  async function register() {
    if (!auth.ready) return;

    const { username, password } = form.values;

    auth.client.create_account({
      username,
      password,
      firstName: "Joe",
      lastName: "Smith",
    });
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
              form.values.username != "" &&
              Object.values(form.errors).length != 0
            }
            fullWidth
            mt="xl"
            onClick={() => {
              Object.keys(form.values)
                .filter((k) => k != "username")
                .forEach(form.validateField);
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
