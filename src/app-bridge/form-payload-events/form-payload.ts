import {
  FormPayloadCategoryTranslate,
  FormPayloadUpdateCategoryTranslate,
} from "@/app-bridge/form-payload-events/event-category-translate";
import {
  FormPayloadCollectionTranslate,
  FormPayloadUpdateCollectionTranslate,
} from "@/app-bridge/form-payload-events/event-collection-translate";
import {
  FormPayloadProductEdit,
  FormPayloadUpdateProductEdit,
} from "@/app-bridge/form-payload-events/event-product-edit";
import {
  FormPayloadProductTranslate,
  FormPayloadUpdateProductTranslate,
} from "@/app-bridge/form-payload-events/event-product-translate";
import {
  FormPayloadShippingMethodTranslate,
  FormPayloadUpdateShippingMethodTranslate,
} from "@/app-bridge/form-payload-events/event-shipping-method-translate";

export type AllFormPayloads =
  | FormPayloadProductTranslate
  | FormPayloadProductEdit
  | FormPayloadCategoryTranslate
  | FormPayloadCollectionTranslate
  | FormPayloadShippingMethodTranslate;

export type AllFormPayloadUpdatePayloads =
  | FormPayloadUpdateProductTranslate
  | FormPayloadUpdateProductEdit
  | FormPayloadUpdateCategoryTranslate
  | FormPayloadUpdateCollectionTranslate
  | FormPayloadUpdateShippingMethodTranslate;

export * from "./event-category-translate";
export * from "./event-collection-translate";
export * from "./event-product-edit";
export * from "./event-shipping-method-translate";
