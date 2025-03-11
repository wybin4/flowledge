import { getPermission } from '@/collections/Permissions';

export function usePermission(name: string) {
    return getPermission(name);
}
