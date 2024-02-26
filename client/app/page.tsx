"use client";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { BentoGrid, BentoGridItem } from "@/components/landing/BentoGrid";
import { HeroParallax } from "@/components/landing/HeroParallax";
import { redirect } from "next/navigation";
import { BiCopyAlt } from "react-icons/bi";
import { WavyBackground } from "@/components/landing/Background";
import { Button } from "@/components/landing/ActionButton";
export default function Home() {
  const theme = localStorage.getItem("theme");
  //redirect("/dashboard");
  const products = [
    {
      title: "Analytics",
      thumbnail: "/screenshots/analytics.png",
    },
    {
      title: "Analytics More",
      thumbnail: "/screenshots/analytics2.png",
    },
    {
      title: "Charts",
      thumbnail: "/screenshots/charts.png",
    },

    {
      title: "Charts More",
      thumbnail: "/screenshots/chartsd.png",
    },
    {
      title: "No Code Automation",
      thumbnail: "/screenshots/composer.png",
    },
    {
      title: "No Code Automation More",
      thumbnail: "/screenshots/composer2.png",
    },

    {
      title: "Docs",
      thumbnail: "/screenshots/docs.png",
    },
    {
      title: "Test Game Unity",
      thumbnail: "/screenshots/game.png",
    },
    {
      title: "Test Game JS",
      thumbnail: "/screenshots/gamed.png",
    },
    {
      title: "Nextra Docs",
      thumbnail: "/screenshots/nextra.png",
    },
    {
      title: "Nextra More",
      thumbnail: "/screenshots/nextra2.png",
    },

    {
      title: "Open Source",
      thumbnail: "/screenshots/opensource.png",
    },
    {
      title: "Swagger",
      thumbnail: "/screenshots/swagger.png",
    },
    {
      title: "Swagger More",
      thumbnail: "/screenshots/swagger2.png",
    },
    {
      title: "Table Management",
      thumbnail: "/screenshots/tables.png",
    },
    {
      title: "Table Management More",
      thumbnail: "/screenshots/tablesd.png",
    },
    {
      title: "User Management",
      thumbnail: "/screenshots/users.png",
    },
  ];

  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
  );
  const items = [
    {
      title: "Manage your data",
      description: "Easily manage your data with our powerful and intuitive interface.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Unreal Blueprints",
      description: "Create and manage your data using blueprints with ease.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Custom endpoints",
      description: "Create custom endpoints to manage your data.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Analytics",
      description: "Gain insights into your data with our powerful analytics tools.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Add blockchain",
      description: "Add blockchain functionality to your game with just a few clicks.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "No code automation",
      description: "Automate your game with our powerful no-code tool.",
      header: <Skeleton />,
      icon: <BiCopyAlt className="h-4 w-4 text-neutral-500" />,
    },
  ];
  return (
    <>
      <Header />
      <main>
        <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill={theme === "dark" ? "#1c1c1c" : "#f8f9fa"}>
          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
            {" "}
            Streamline Your <br /> Game Management
          </p>
          <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
            Elevate your game development experience with our no-code Game Management System.
          </p>
          <div className="max-w-lg mt-14 mx-auto text-center">
            <Button borderRadius="0.5rem" className="bg-white  dark:bg-[#1c1c1c] text-black text-2xl dark:text-white border-neutral-200 dark:border-slate-800">
              Get Started
            </Button>
          </div>
        </WavyBackground>

        <section id="features" aria-label="Features for running your books" className="relative pt-20 overflow-hidden bg-dark pb-28 sm:py-32">
          <BentoGrid className="mx-auto bg-dark ">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </section>
        <HeroParallax products={products} />
      </main>
      <Footer />
    </>
  );
}
