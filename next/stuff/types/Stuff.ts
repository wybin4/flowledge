import { StuffTypes } from "./StuffTypes"

export interface Stuff {
    _id: string;
    type: StuffTypes;
    value?: string;
    file?: File;
}