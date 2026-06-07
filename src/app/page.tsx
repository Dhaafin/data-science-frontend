import type { Metadata } from "next";
import HomeOrganism from "@/components/organisms/home/HomeOrganism";

export const metadata: Metadata = {
  title: "Home | Selasar Suara",
  description: "Platform analisis data spasial musisi Indonesia, memetakan asal seniman dan menganalisis popularitas genre di berbagai wilayah.",
};

export default function Home() {
  return <HomeOrganism />;
}
