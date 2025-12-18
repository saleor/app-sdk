import {
  FormPayloadProductEdit,
  FormPayloadUpdatePayloadProductEdit,
} from "@/app-bridge/form-payload-events/event-product-edit";
import {
  FormPayloadProductTranslate,
  FormPayloadUpdatePayloadProductTranslate,
} from "@/app-bridge/form-payload-events/event-product-translate";

export type AllFormPayloads = FormPayloadProductTranslate | FormPayloadProductEdit;

export type AllFormPayloadUpdatePayloads =
  | FormPayloadUpdatePayloadProductTranslate
  | FormPayloadUpdatePayloadProductEdit;
