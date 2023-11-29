import { trace, Tracer } from "@opentelemetry/api";

import pkg from "../package.json";

const TRACER_NAME = "app-sdk";

export const getOtelTracer = (): Tracer => trace.getTracer(TRACER_NAME, pkg.version);
