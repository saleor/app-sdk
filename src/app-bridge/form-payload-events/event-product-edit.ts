import {
  BaseFormPayloadUpdatePayload,
  FormPayloadUpdateSingleFieldResult,
  ProductPayloadBase,
} from "@/app-bridge/form-payload-events/common";

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
