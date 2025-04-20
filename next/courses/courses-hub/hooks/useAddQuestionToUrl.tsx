import { addParamToUrl } from "@/helpers/addParamToUrl";
import { useRouter, useSearchParams } from "next/navigation";

export const useAddQuestionToUrl = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    return (questionId?: string) => {
        questionId && addParamToUrl({ router, searchParams, param: { questionId } });
    };
};