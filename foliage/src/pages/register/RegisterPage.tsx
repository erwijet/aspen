import NavBar from "@/shared/NavBar";
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

const RegisterPage = () => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      passwordConf: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value, { passwordConf }) =>
        value == passwordConf ? null : "Passwords must match",
      passwordConf: (value, { password }) =>
        value == password ? null : "Passwords must match",
    },
  });

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
            label="Email"
            placeholder="me@example.com"
            required
            {...form.getInputProps("email")}
          />
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

          <Button fullWidth mt="xl" onClick={() => form.validate()}>
            Blastoff
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
