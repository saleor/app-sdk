export type TranslationField = {
  fieldName: string;
  originalValue: string;
  translatedValue: string;
  currentValue: string;
  type: "short-text" | "editorjs" | "long-text";
};

export type ProductPayloadBase = {
  productId: string;
};

export type FormPayloadUpdateSingleFieldResult = {
  value: string;
};
