import type { Middleware } from "retes";

import { Response } from 'retes/response';

import * as Const from './const';

export const withBaseURL: Middleware = (handler) => async (request) => {
  const { host, "x-forwarded-proto": protocol = "http" } = request.headers;

  request.context.baseURL = `${protocol}://${host}`;

  const response = await handler(request);
  return response;
}

export const withSaleorDomainPresent: Middleware = (handler) => async (request) => {
  const saleor_domain = request.headers[Const.SALEOR_DOMAIN_HEADER];

  if (!saleor_domain) {
    return Response.BadRequest({ success: false, message: "Missing Saleor domain header." });
  }

  return handler(request);
};

export const withSaleorEventMatch = (expectedEvent: string): Middleware => (handler) => async (request) => {
  const receivedEvent = request.headers[Const.SALEOR_EVENT_HEADER];

  if (receivedEvent !== expectedEvent) {
    return Response.BadRequest({ success: false, message: "Invalid Saleor Event" });
  }

  return handler(request);
};

export const withAuthTokenRequired: Middleware = (handler) => async (request) => {
  const auth_token = request.params.auth_token;
  if (!auth_token) {
    return Response.BadRequest({ success: false, message: "Missing auth token." });
  }

  return handler(request);
};