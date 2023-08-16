import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://raw.githubusercontent.com/saleor/saleor/main/saleor/graphql/schema.graphql",
  documents: [], // No need to search for documents, we are only generating enums
  ignoreNoDocuments: true, // Prevents throwing error on generating types in project without typed queries
  generates: {
    "./src/generated-enums.ts": {
      plugins: [
        "typescript",
        {
          add: {
            content: [
              "/**",
              " * Generated file, do not modify it by hand.",
              " * To update it to the current schema, use `pnpm generate` script.",
              " */",
            ],
          },
        },
      ],
      config: {
        onlyEnums: true,
        enumsAsTypes: true,
        typesPrefix: "Generated", // Added the prefix since we export only subset of all enums
      },
    },
  },
  hooks: {
    afterAllFileWrite: "prettier --write",
  },
};
export default config;
