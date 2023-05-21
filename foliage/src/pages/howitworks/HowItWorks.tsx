import { getAuthority } from "@/shared/getAuthority";
import { useUserStore } from "@/shared/user";
import { isSome, pipe } from "@bryx-inc/ts-utils";
import {
  ThemeIcon,
  Text,
  Title,
  Container,
  SimpleGrid,
  createStyles,
  rem,
  Badge,
  Kbd,
  Code,
} from "@mantine/core";
import { motion, TargetAndTransition, Transition } from "framer-motion";

const Username = () => {
  const username = useUserStore.use.username();
  const isAuthed = pipe(getAuthority(), isSome);
  return <>{isAuthed ? username : "<your-aspen-username>"}</>;
};

const STEPS = [
  {
    title: "Register for Aspen",
    description:
      "It's as easy as picking a username as password. Once you are registered, you can start creating some links that you visit often.",
  },
  {
    title: "Configure Your Browser",
    description: (
      <>
        In your browser, create a 'site search' with a shortcut of{" "}
        <Kbd>asp</Kbd> that points to{" "}
        <Code>https://api.aspn.app/search/{<Username />}?q=%s</Code>
      </>
    ),
  },
  {
    title: "Blastoff",
    description: (
      <>
        Use your <Kbd>asp</Kbd> shortcut in your browser's search bar followed
        by a space to search your Aspen links by keyword!
      </>
    ),
  },
];

function getTransition(idx: number): Transition {
  return { ease: "easeInOut", duration: 0.75, delay: idx * 0.1 };
}

const anim: TargetAndTransition = {
  y: [50, 0],
  opacity: [0, 1],
};

type StepProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  idx: number;
};

const Step = ({ title, description, idx }: StepProps) => {
  return (
    <motion.div animate={anim} transition={getTransition(idx + 1)}>
      <ThemeIcon variant="light" size={40} radius={40}>
        <Badge>{idx + 1}</Badge>
      </ThemeIcon>
      <Text mt="sm" mb={7}>
        {title}
      </Text>
      <Text size="sm" color="dimmed" sx={{ lineHeight: 1.6 }}>
        {description}
      </Text>
    </motion.div>
  );
};

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    marginBottom: theme.spacing.md,
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      textAlign: "left",
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

const HowItWorksPage = () => {
  const { classes } = useStyles();
  const steps = STEPS.map((feature, index) => (
    <Step {...feature} key={index} idx={index} />
  ));

  return (
    <motion.div animate={anim} transition={getTransition(0)}>
      <Container className={classes.wrapper}>
        <Title className={classes.title}>
          How it <span className={classes.highlight}> Works</span>
        </Title>

        <Container size={560} p={0}>
          <Text size="sm" className={classes.description}>
            Aspen works in most modern browsers by leveraging a feature known as
            Site Search. Gettings started is as easy as 1, 2, 3.
          </Text>
        </Container>

        <SimpleGrid
          mt={60}
          cols={3}
          spacing={50}
          breakpoints={[
            { maxWidth: 980, cols: 2, spacing: "xl" },
            { maxWidth: 755, cols: 1, spacing: "xl" },
          ]}
        >
          {steps}
        </SimpleGrid>
      </Container>
    </motion.div>
  );
};

export default HowItWorksPage;
