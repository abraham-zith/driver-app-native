




export const documentApi = {
    /**
    * Upload binary file directly to S3 using the pre-signed URL
    */
    uploadToS3: async (
        url: string,
        filePath: string,
        contentType: string,
        onProgress?: (progress: number) => void
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', contentType);

            if (xhr.upload && onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        onProgress(event.loaded / event.total);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                    resolve();
                } else {
                    console.error('DEBUG: ===== S3 UPLOAD FAILURE =====');
                    console.error('DEBUG: Status:', xhr.status, xhr.statusText);
                    console.error('DEBUG: Response Headers:', xhr.getAllResponseHeaders());
                    console.error('DEBUG: Response Body:', xhr.responseText);
                    console.error('DEBUG: ==============================');
                    reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.statusText || 'Unknown Error'}`));
                }
            };

            xhr.onerror = (e) => {
                console.error('DEBUG: S3 Upload Network Error:', e);
                console.error('DEBUG: Request URL was:', url);
                reject(new Error('Network error during S3 upload. Please check your connection or CORS settings.'));
            };

            // In React Native, XHR can send a file object directly
            const file = {
                uri: filePath.startsWith('file://') ? filePath : 'file://' + filePath,
                type: contentType,
                name: filePath.split('/').pop(),
            };

            xhr.send(file as any);
        });
    },

};
