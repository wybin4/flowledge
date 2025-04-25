import { GetDataPage } from "@/types/GetDataPage";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";
import { CachedCollection } from "./CachedCollection";
import { Identifiable } from "@/types/Identifiable";

export class CachedCollectionWithPagination<T extends Identifiable> extends CachedCollection<T> {
    getPage({ page, pageSize, searchQuery }: GetDataPage): T[] {
        const offset = (page - 1) * pageSize;

        return this.collection.chain()
            .find(searchQuery ? {
                _id: { $regex: new RegExp(searchQuery, "i") }
            } : {})
            .offset(offset)
            .limit(pageSize)
            .data();
    }

    getTotalCount({ searchQuery }: GetTotalCountPage): number {
        if (!searchQuery) {
            return this.collection.count();
        }

        return this.collection.chain()
            .find({ _id: { $regex: new RegExp(searchQuery, "i") } })
            .data().length;
    }
}