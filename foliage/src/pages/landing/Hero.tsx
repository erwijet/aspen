import { Button, Group } from "@mantine/core";

import image from "@/../assets/brand.png";
import {
  Container,
  createStyles,
  Image,
  List,
  rem,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { motion, Transition, TargetAndTransition } from "framer-motion";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },
  content: {
    maxWidth: rem(480),
    marginRight: `calc(${theme.spacing.xl} * 3)`,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      marginRight: 0,
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: rem(44),
    lineHeight: 1.2,
    fontWeight: 900,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      flex: 1,
    },
  },

  image: {
    flex: 1,

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  highlight: {
    position: "relative",
    backgroundColor: theme.fn.variant({
      variant: "light",
      color: theme.primaryColor,
    }).background,
    borderRadius: theme.radius.sm,
    padding: `${rem(4)} ${rem(12)}`,
  },
}));

export const Hero = () => {
  const { classes } = useStyles();

  function getTransition(idx: number): Transition {
    return { ease: "easeInOut", duration: 0.75, delay: idx * 0.1 };
  }

  const anim: TargetAndTransition = {
    y: [50, 0],
    opacity: [0, 1],
  };

  return (
    <div>
      <Container>
        <div className={classes.inner}>
          <div className={classes.content}>
            <motion.div animate={anim} transition={getTransition(0)}>
              <Title className={classes.title}>
                A{" "}
                <motion.span className={classes.highlight}>
                  developer-first
                </motion.span>{" "}
                <br /> take on bookmarks
              </Title>
            </motion.div>
            <motion.div animate={anim} transition={getTransition(1)}>
              <Text color="dimmed" mt="md">
                Save the links you need to access most alongside a set of
                keywords for easy lookup. Any browser. Any device. Anywhere.
              </Text>
            </motion.div>

            <motion.div animate={anim} transition={getTransition(2)}>
              <List
                mt={30}
                spacing="sm"
                size="sm"
                icon={
                  <ThemeIcon size={20} radius="xl">
                    <IconCheck size={rem(12)} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <b>Browser Agnostic</b> – no more configuring and
                  reconfiguring your bookmarks or custom serach engine redirects
                </List.Item>
                <List.Item>
                  <b>Free and open source</b> – all aspects of Aspen are
                  distributed under the MIT license
                </List.Item>
                <List.Item>
                  <b>Powered by the Hypebeast Stack</b> – with microservices
                  written in rust, communicating with gRPC, Aspen's hypebeast
                  stack is the essence of web scale.
                </List.Item>
              </List>
            </motion.div>

            <motion.div animate={anim} transition={getTransition(3)}>
              <Group mt={30}>
                <Button radius="xl" size="md" className={classes.control}>
                  Get started
                </Button>
                <a href={"https://github.com/erwijet/aspen"}>
                  <Button
                    variant="default"
                    radius="xl"
                    size="md"
                    className={classes.control}
                  >
                    Source code
                  </Button>
                </a>
              </Group>
            </motion.div>
          </div>
          <motion.div animate={anim} transition={getTransition(2)}>
            <Image src={image} className={classes.image} />
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
