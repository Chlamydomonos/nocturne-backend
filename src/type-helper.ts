export type PublicFields<T> = {
    [K in keyof T]: T[K];
};

type ParamType<T extends Function> = T extends (...args: infer P) => any ? P : never;
type ReturnType<T extends Function> = T extends (...args: any[]) => infer R ? R : never;
type AsyncReturnType<T extends Function> = ReturnType<T> extends Promise<any> ? ReturnType<T> : Promise<ReturnType<T>>;
type Async<T> = T extends Function ? (...args: ParamType<T>) => AsyncReturnType<T> : () => Promise<T>;

export type DeepAsync<T> = {
    [K in keyof T]: T[K] extends Function ? Async<T[K]> : T[K] extends object ? DeepAsync<T[K]> : Async<T[K]>;
};
