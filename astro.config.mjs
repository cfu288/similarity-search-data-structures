import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://cfu288.github.io",
  base: "/similarity-search-data-structures/",
  integrations: [mdx(), react(), tailwind(), sitemap()],
});
