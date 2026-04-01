// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "SortAO",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Aurora-creeper/SortAO",
        },
      ],
      sidebar: [
        { label: "Core", autogenerate: { directory: "core" } },
        {
          label: "Associative",
          autogenerate: { directory: "associative" },
        },
        {
          label: "Sorted Blocks",
          autogenerate: { directory: "sorted-blocks" },
        },
        {
          label: "Tree",
          autogenerate: { directory: "tree" },
        },
        {
          label: "更多结构",
          autogenerate: { directory: "more" },
        },
        {
          label: "接口与保证",
          autogenerate: { directory: "protocols" },
        },
        {
          label: "其他",
          translations: {
            "zh-cn": "其他",
            en: "Others",
          },
          autogenerate: { directory: "others" },
        },
      ],

      defaultLocale: "root",
      locales: {
        "root": {
          label: "简体中文",
          lang: "zh-CN",
        },
        en: {
          label: "English",
          lang: "en",
        },
      },

      customCss: [
        "./src/styles/user.css",
        //  "katex/dist/katex.min.css"
      ],
    }),
  ],
  markdown: {
    // remarkPlugins: [remarkMath],
    // rehypePlugins: [rehypeKatex],
  },
});
