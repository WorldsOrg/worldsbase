"use client";
import { Flex, Stack } from "@chakra-ui/react";
import { FiGrid, FiPlay } from "react-icons/fi";
import { SidebarButton } from "./SidebarButton";
import styles from "./side_bar.module.css";
import { useRouter } from "next/navigation";
import { FaNetworkWired, FaChevronRight, FaChevronDown } from "react-icons/fa";
import React, { useState } from "react";

export const SideBar = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const apiButtonClick = () => {
    setDropdownOpen(!dropdownOpen);
    router.push("/dashboard/docs/api");
  };

  return (
    <Flex as="section" minH="100vh" position={"fixed"}>
      <Stack flex="1" py={{ base: "6", sm: "8" }} px={{ base: "2" }} pr={{ base: "10" }} bg="bg.surface" borderRightWidth="1px" justifyContent="space-between">
        <Stack spacing="8">
          <Stack spacing="1">
            <SidebarButton onClick={() => router.push("/dashboard/docs")} className={styles.navigationButton} leftIcon={<FiGrid />}>
              Getting Started
            </SidebarButton>
            <SidebarButton onClick={() => apiButtonClick()} className={styles.navigationButton} leftIcon={dropdownOpen ? <FaChevronDown /> : <FaChevronRight />}>
              API
            </SidebarButton>
            {dropdownOpen && (
              <Stack>
                <SidebarButton ml={"40px"} onClick={() => router.push("/dashboard/docs/api#auth")} className={styles.navigationButton}>
                  Auth
                </SidebarButton>
                <SidebarButton ml={"40px"} onClick={() => router.push("/dashboard/docs/api#table-editing")} className={styles.navigationButton}>
                  Table Editing
                </SidebarButton>
                <SidebarButton ml={"40px"} onClick={() => router.push("/dashboard/docs/api#web3")} className={styles.navigationButton}>
                  Web3
                </SidebarButton>
              </Stack>
            )}
            <SidebarButton onClick={() => router.push("/dashboard/docs/demo")} className={styles.navigationButton} leftIcon={<FiPlay />}>
              Demo Game
            </SidebarButton>
          </Stack>
        </Stack>
      </Stack>
    </Flex>
  );
};
