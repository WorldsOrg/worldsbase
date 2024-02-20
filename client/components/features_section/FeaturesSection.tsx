import { Box, Button, Container, Heading, Icon, SimpleGrid, Square, Stack, Text } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";
import { BsFillMoonFill, BsStars, BsCodeSlash } from "react-icons/bs";
import { FaAccessibleIcon, FaExpandAlt, FaPaintBrush } from "react-icons/fa";
import { IoRocketSharp } from "react-icons/io5";

export const features = [
  {
    name: "Developer friendly",
    description: "Simple and easy-to-use features that make your life easier.",
    icon: BsStars,
  },
  {
    name: "Production Ready",
    description: "Effortlessly create your next production-ready experience with WGS.",
    icon: IoRocketSharp,
  },
  {
    name: "No code required",
    description: "Really, no code required. Just use our dashboard to manage your game.",
    icon: BsCodeSlash,
  },
  {
    name: "Customizable",
    description: "Customize your dashboard to suit your game's needs.",
    icon: FaPaintBrush,
  },
  {
    name: "Scalable",
    description: "Get the features you need, when you need them.",
    icon: FaExpandAlt,
  },
  {
    name: "Accessible",
    description: "Accessibility first. That's why we pay attention to accessibility right from the start.",
    icon: FaAccessibleIcon,
  },
];

export const FeaturesSection = () => (
  <Stack spacing={{ base: "12", md: "16" }}>
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} columnGap={8} rowGap={{ base: 10, md: 16 }}>
      {features.map((feature) => (
        <Stack key={feature.name} spacing={{ base: "4", md: "5" }}>
          <Square size={{ base: "10", md: "12" }} bg="accent" color="fg.inverted" borderRadius="lg">
            <Icon as={feature.icon} boxSize={{ base: "5", md: "6" }} />
          </Square>
          <Stack spacing={{ base: "1", md: "2" }} flex="1">
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="medium">
              {feature.name}
            </Text>
            <Text color="fg.muted">{feature.description}</Text>
          </Stack>
          <Button variant="text" colorScheme="blue" rightIcon={<FiArrowRight />} alignSelf="start">
            Read more
          </Button>
        </Stack>
      ))}
    </SimpleGrid>
  </Stack>
);
