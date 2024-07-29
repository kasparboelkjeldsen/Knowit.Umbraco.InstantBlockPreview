﻿import { defineConfig } from "vite";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the output directory from environment variables or fallback to default
const outDir = process.env.OUT_DIR || './../App_Plugins/knowit-instantblockpreview';

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts", // Entrypoint file (registers other manifests)
            formats: ["es"],
            fileName: "knowit-instantblockpreview",
        },
        outDir, // Set the output directory
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});
