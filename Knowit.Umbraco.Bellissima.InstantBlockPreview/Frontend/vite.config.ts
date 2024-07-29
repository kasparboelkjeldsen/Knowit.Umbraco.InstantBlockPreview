import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts", // Entrypoint file (registers other manifests)
            formats: ["es"],
            fileName: "knowit-instantblockpreview",
        },
        outDir: "./../App_Plugins/Knowit.Umbraco.InstantBlockPreview", // your web component will be saved to the RCL project location and the RCL sets the path as App_Plugins/my-package
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});
