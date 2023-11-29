import { trace, Tracer } from "@opentelemetry/api";

import pkg from "../package.json";

const TRACER_NAME = "app-sdk";

export const getOtelTracer = (): Tracer => trace.getTracer(TRACER_NAME, pkg.version);

export const OTEL_CORE_SERVICE_NAME = "core";
export const OTEL_APL_SERVICE_NAME = "apps-cloud-apl";
