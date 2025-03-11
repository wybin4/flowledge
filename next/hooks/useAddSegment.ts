import { useRouter, usePathname } from 'next/navigation';

const useAddSegment = () => {
    const router = useRouter();
    const pathname = usePathname();

    const modifyLastSegment = (segment: string) => {
        const segments = pathname.split('/').filter(Boolean);
        segments.pop();
        segments.push(segment);
        const newPath = `/${segments.join('/')}`;
        router.push(newPath);
    };

    return { modifyLastSegment };
};

export default useAddSegment;
