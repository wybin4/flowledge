export const getAllowedFileFormats = (prefix: string, fileExtensionsString?: string) => {
    if (!fileExtensionsString) return {
        allowedFileExtensions: ['*'],
        acceptedMimeTypes: `${prefix}/*`
    };

    const allowedFileExtensions = fileExtensionsString.split(',').map(f => f.trim());

    if (allowedFileExtensions.includes('*')) {
        return {
            allowedFileExtensions: ['*'],
            acceptedMimeTypes: `${prefix}/*`
        };
    }

    return {
        allowedFileExtensions,
        acceptedMimeTypes: allowedFileExtensions.map(f => `${prefix}/${f}`).join(',')
    };
};