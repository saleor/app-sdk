export const formPayloadUpdateActionName = "formPayloadUpdate";
export const formPayloadEventName = "formPayload";

export type FormPayloadUpdateSingleFieldResult = {
  value: string;
};

export type BaseFormPayloadUpdatePayload<FieldName extends string = string> = {
  /**
   * Whether POPUP should be closed after this event is emitted. Default true. For non-popup extensions will be ignored.
   */
  closePopup?: boolean;
  fields: Record<FieldName, FormPayloadUpdateSingleFieldResult>;
};

type ProductPayloadBase = {
  productId: string;
};

/**
 * TRANSLATIONS
 */

type TranslationField = {
  fieldName: string;
  originalValue: string;
  translatedValue: string;
  currentValue: string;
  type: "short-text" | "editorjs" | "long-text";
};

export type FormPayloadProductTranslate = ProductPayloadBase & {
  translationLanguage: string;
  form: "product-translate";
  fields: Record<
    "productName" | "productDescription" | "seoName" | "seoDescription",
    TranslationField
  >;
};

export type FormPayloadUpdatePayloadProductTranslate = BaseFormPayloadUpdatePayload & {
  form: "product-translate";
  fields: {
    productName?: FormPayloadUpdateSingleFieldResult;
    productDescription?: FormPayloadUpdateSingleFieldResult;
    seoName?: FormPayloadUpdateSingleFieldResult;
    seoDescription?: FormPayloadUpdateSingleFieldResult;
  };
};

/**
 * PRODUCT
 */
export type FormPayloadProductEdit = ProductPayloadBase & {
  form: "product-edit";
  fields: Record<
    "productName" | "productDescription",
    {
      fieldName: string;
      originalValue: string;
      currentValue: string;
      type: "short-text" | "editorjs" | "long-text";
    }
  >;
};

export type FormPayloadUpdatePayloadProductEdit = BaseFormPayloadUpdatePayload & {
  form: "product-edit";
  fields: {
    productName?: FormPayloadUpdateSingleFieldResult;
    productDescription?: FormPayloadUpdateSingleFieldResult;
  };
};

export type AllFormPayloads = FormPayloadProductTranslate | FormPayloadProductEdit;

export type AllFormPayloadUpdatePayloads =
  | FormPayloadUpdatePayloadProductTranslate
  | FormPayloadUpdatePayloadProductEdit;
