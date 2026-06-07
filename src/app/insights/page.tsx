import type { Metadata } from "next";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights | Selasar Suara",
  description: "Analisis mendalam format musisi, popularitas, loyalitas pendengar, serta visualisasi data interaktif Selasar Suara.",
};

export default function InsightsPage() {
  return <InsightsClient />;
}
