import { IPermission } from "@/types/Permission";
import { CachedCollectionWithPagination } from "./CachedCollectionWithPagination";

export const Permissions = new CachedCollectionWithPagination<IPermission>('permissions');
