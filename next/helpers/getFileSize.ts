export const getFileSize = (bytes: number, decimals?: number): string => {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals || 0;

    const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
};
