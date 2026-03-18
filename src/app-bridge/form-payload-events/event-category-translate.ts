import {
  FormPayloadUpdateSingleFieldResult,
  TranslationField,
} from "@/app-bridge/form-payload-events/common";

type FormId = "category-translate";
type Fields = "categoryName" | "categoryDescription" | "seoName" | "seoDescription";

export type FormPayloadCategoryTranslate = {
  categoryId: string;
  translationLanguage: string;
  form: FormId;
  fields: Record<Fields, TranslationField>;
};

export type FormPayloadUpdateCategoryTranslate = {
  form: FormId;
  closePopup?: boolean;
  fields: Record<Fields, FormPayloadUpdateSingleFieldResult>;
};
