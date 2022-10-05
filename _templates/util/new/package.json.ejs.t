---
inject: true
to: package.json
after: "exports"
---
    "./<%= name.toLowerCase() %>": {
      "types": "./<%= name.toLowerCase() %>.d.ts",
      "import": "./<%= name.toLowerCase() %>.mjs",
      "require": "./<%= name.toLowerCase() %>.js"
    },