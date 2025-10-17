export const formUpdateActionName = "formUpdate";

export type FormUpdateSingleFieldResult =
  | {
      value: string;
    }
  | {
      errors: Array<{ message: string }>;
    };

// todo maybe redundant? or internface + class
export type BaseFormUpdatePayload = {
  form: string;
  fields: Record<string, FormUpdateSingleFieldResult>;
};

// todo maybe class
export type FormUpdatePayloadProductTranslate = BaseFormUpdatePayload & {
  form: "product-translate";
  fields: {
    productName: FormUpdateSingleFieldResult;
    productDescription: FormUpdateSingleFieldResult;
    seoName: FormUpdateSingleFieldResult;
    seoDescription: FormUpdateSingleFieldResult;
  };
};

export type AllFormUpdatePayloads = FormUpdatePayloadProductTranslate;
