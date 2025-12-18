import {
  FormPayloadCategoryTranslate,
  FormPayloadUpdateCategoryTranslate,
} from "@/app-bridge/form-payload-events/event-category-translate";
import {
  FormPayloadProductEdit,
  FormPayloadUpdateProductEdit,
} from "@/app-bridge/form-payload-events/event-product-edit";
import {
  FormPayloadProductTranslate,
  FormPayloadUpdateProductTranslate,
} from "@/app-bridge/form-payload-events/event-product-translate";

export type AllFormPayloads =
  | FormPayloadProductTranslate
  | FormPayloadProductEdit
  | FormPayloadCategoryTranslate;

export type AllFormPayloadUpdatePayloads =
  | FormPayloadUpdateProductTranslate
  | FormPayloadUpdateProductEdit
  | FormPayloadUpdateCategoryTranslate;
