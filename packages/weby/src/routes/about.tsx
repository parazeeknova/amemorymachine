import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "#/features/about/components/about-page";

const AboutRoute = () => <AboutPage />;

export const Route = createFileRoute("/about")({
  component: AboutRoute,
  head: () => ({
    links: [
      {
        href: "https://amemorymachine.cc/about",
        rel: "canonical",
      },
    ],
    meta: [
      { title: "amemorymachine — about" },
      {
        content:
          "amemorymachine is a self-hosted markdown editor and personal knowledge base: a private, retrieval-augmented mind for its owner, with desktop apps and self-hosted containers. free, open source, MIT licensed.",
        name: "description",
      },
      {
        content:
          "amemorymachine, markdown editor, personal knowledge base, self-hosted, PKM, RAG, notes, open source, MIT, download",
        name: "keywords",
      },
      { content: "parazeeknova", name: "author" },
      { content: "index, follow, max-image-preview:large", name: "robots" },
      { content: "amemorymachine", name: "application-name" },
      { content: "#111111", name: "theme-color" },
      { content: "amemorymachine — about", property: "og:title" },
      {
        content:
          "amemorymachine is a self-hosted markdown editor and personal knowledge base: a private, retrieval-augmented mind for its owner.",
        property: "og:description",
      },
      { content: "website", property: "og:type" },
      { content: "https://amemorymachine.cc/about", property: "og:url" },
      { content: "amemorymachine", property: "og:site_name" },
      { content: "en_US", property: "og:locale" },
      { content: "https://amemorymachine.cc/amemorymachine-og.png", property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: "image/png", property: "og:image:type" },
      { content: "summary_large_image", property: "twitter:card" },
      { content: "amemorymachine — about", property: "twitter:title" },
      {
        content:
          "amemorymachine is a self-hosted markdown editor and personal knowledge base: a private, retrieval-augmented mind for its owner.",
        property: "twitter:description",
      },
      { content: "https://amemorymachine.cc/amemorymachine-og.png", property: "twitter:image" },
    ],
  }),
});
