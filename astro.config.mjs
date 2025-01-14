import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import Icons from "unplugin-icons/vite";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    integrations: [
        svelte(),
        tailwind({
            applyBaseStyles: false,
        }),
    ],
    vite: {
        plugins: [
            Icons({
                compiler: "astro",
            }),
        ],
    },
    site: "https://standafer.github.io",
    base: "scc-utils",
});
