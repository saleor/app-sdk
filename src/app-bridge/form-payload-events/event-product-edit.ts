import {
  FormPayloadUpdateSingleFieldResult,
  ProductPayloadBase,
} from "@/app-bridge/form-payload-events/common";

type FormId = "product-edit";
type Fields = "productName" | "productDescription";

export type FormPayloadProductEdit = ProductPayloadBase & {
  form: FormId;
  fields: Record<
    Fields,
    {
      fieldName: string;
      originalValue: string;
      currentValue: string;
      type: "short-text" | "editorjs" | "long-text";
    }
  >;
};

export type FormPayloadUpdateProductEdit = {
  form: FormId;
  closePopup?: boolean;
  fields: Record<Fields, FormPayloadUpdateSingleFieldResult>;
};
