import type { Metadata } from "next";
import { SideBar } from "@/components/side_bar/SideBar";
import { Flex } from "@chakra-ui/react";
import { Inter } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Worlds Dashboard",
  description: "Generated by Worlds Dev Team with Love",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full text-primary" >
      <Flex>
        <SideBar />
        <div className={`w-full ${inter.className}`} style={{ marginLeft: "200px", padding: 40 }}>
          {children}
        </div>{" "}
      </Flex>
    </div>
  );
}
