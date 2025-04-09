import { TablePageActionType } from "@/types/TablePageActionType";

export type TablePageActionCallback<T> = (type: TablePageActionType, item?: T) => void;