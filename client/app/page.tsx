import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

import { PrimaryFeatures } from "@/components/landing/PrimaryFeatures";
import { SecondaryFeatures } from "@/components/landing/SecondaryFeatures";
import { redirect } from "next/navigation";

export default async function Home() {
  //redirect("/dashboard");

  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
