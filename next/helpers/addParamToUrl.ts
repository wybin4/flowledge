import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

export const addParamToUrl = ({
    router, searchParams,
    param
}: {
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
    param: { [key: string]: string }
}) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(param)) {
        params.set(key, value);
    }
    router.push(`?${params.toString()}`);
};