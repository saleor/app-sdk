import { createAPLDebug } from "../apl-debug";

const debug = createAPLDebug("Paginator");

interface PaginationResponse<ResultType> {
  next: string | null;
  previous: string | null;
  results: ResultType[];
}

export class Paginator<ResultType> {
  constructor(
    private readonly url: string,
    private readonly fetchOptions: RequestInit,
    private readonly fetchFn = fetch
  ) {}

  public async fetchAll() {
    debug("Fetching all pages for url", this.url);
    const response = await this.fetchFn(this.url, this.fetchOptions);
    debug("%0", response);

    const json = (await response.json()) as PaginationResponse<ResultType>;

    if (json.next) {
      const remainingPages = await this.fetchNext(json.next);
      const allResults = [...json.results, ...remainingPages.flatMap((page) => page.results)];
      debug("Fetched all pages, total length: %d", allResults.length);

      return {
        next: null,
        previous: null,
        count: allResults.length,
        results: allResults,
      };
    }

    debug("No more pages to fetch, returning first page");
    return json;
  }

  private async fetchNext(nextUrl: string): Promise<Array<PaginationResponse<ResultType>>> {
    debug("Fetching next page with url %s", nextUrl);
    const response = await this.fetchFn(nextUrl, this.fetchOptions);
    debug("%0", response);

    const json = (await response.json()) as PaginationResponse<ResultType>;

    if (json.next) {
      return [json, ...(await this.fetchNext(json.next))];
    }
    return [json];
  }
}
