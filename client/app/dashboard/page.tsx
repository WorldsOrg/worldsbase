"use client";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/table_editor");

  return <></>;
}
