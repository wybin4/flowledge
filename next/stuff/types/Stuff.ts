import { StuffTypes } from "./StuffTypes"

export interface Stuff {
    id: string;
    type: StuffTypes;
    value?: string;
    file?: File;
}