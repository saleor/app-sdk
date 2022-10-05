---
to: hygen-create.json
---
{
  "about": "This is a hygen-create definitions file. The hygen-create utility creates generators that can be executed using hygen.",
  "hygen_create_version": "0.2.0",
  "name": "util",
  "files_and_dirs": {
    "hygen-create.json": true,
    "src/<%= name.toLowerCase() %>.ts": true,
    "src/<%= name.toLowerCase() %>.test.ts": true,
    "src/index.ts": true,
    "package.json": true
  },
  "templatize_using_name": "<%= name.toLowerCase() %>",
  "gen_parent_dir": false
}