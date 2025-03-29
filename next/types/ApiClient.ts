export type ApiClient<T> = <T>(request: ApiClientRequest) => Promise<T>;
export type FakeApiClient<T> = <T>(request: ApiClientRequest) => T;
export type ApiClientRequest = { url: string, options?: RequestInit };
