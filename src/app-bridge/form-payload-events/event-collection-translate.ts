import {
  FormPayloadUpdateSingleFieldResult,
  TranslationField,
} from "@/app-bridge/form-payload-events/common";

type FormId = "collection-translate";
type Fields = "collectionName" | "collectionDescription" | "seoName" | "seoDescription";

export type FormPayloadCollectionTranslate = {
  collectionId: string;
  translationLanguage: string;
  form: FormId;
  fields: Record<Fields, TranslationField>;
};

export type FormPayloadUpdateCollectionTranslate = {
  form: FormId;
  closePopup?: boolean;
  fields: Record<Fields, FormPayloadUpdateSingleFieldResult>;
};
