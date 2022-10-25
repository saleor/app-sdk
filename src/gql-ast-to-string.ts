import { ASTNode, print } from "graphql";

export const gqlAstToString = (ast: ASTNode) =>
  print(ast) // convert AST to string
    .replaceAll(/\n*/g, "") // remove new lines
    .replaceAll(/\s{2,}/g, " ") // remove unnecessary multiple spaces
    .trim(); // remove whitespace from beginning and end
