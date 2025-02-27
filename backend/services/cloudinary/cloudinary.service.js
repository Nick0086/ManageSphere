// cloudinaryService.js
import cloudinary from '../../config/cloudinary.js';
import { PassThrough } from 'stream';

/**
 * Upload a file to Cloudinary.
 * 
 * @param {string} filePath - The local file path or a buffer to be uploaded.
 * @param {Object} [options] - Optional parameters for the upload (e.g., folder, public_id).
 * @returns {Promise<Object>} - The response from Cloudinary upload operation.
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        const response = await cloudinary.uploader.upload(filePath, options);
        console.log('uploadToCloudinary response:', response);
        return response;
    } catch (error) {
        console.error('uploadToCloudinary error:', error);
        throw error;
    }
};

/**
 * List resources in a Cloudinary folder.
 * 
 * @param {string} [prefix] - (Optional) Folder or resource prefix to filter the resources.
 * @param {string} [resourceType] - (Optional) Type of resource ('image', 'video', etc.). Defaults to 'image'.
 * @returns {Promise<Object>} - The response containing the list of resources.
 */
export const listResources = async (prefix = '', resourceType = 'image') => {
    try {
        const response = await cloudinary.api.resources({
            type: 'upload',
            prefix,
            resource_type: resourceType,
        });
        console.log('listResources response:', response);
        return response;
    } catch (error) {
        console.error('listResources error:', error);
        throw error;
    }
};

/**
 * Generate a URL for a resource in Cloudinary.
 * 
 * @param {string} publicId - The public ID of the Cloudinary resource.
 * @param {Object} [options] - Optional parameters for transformation (e.g., width, height, crop).
 * @returns {string} - The generated URL for accessing the resource.
 */
export const getUrlFromCloudinary = (publicId, options = {}) => {
    try {
        const url = cloudinary.url(publicId, options);
        console.log('getUrlFromCloudinary URL:', url);
        return url;
    } catch (error) {
        console.error('getUrlFromCloudinary error:', error);
        throw error;
    }
};

/**
 * Delete a resource from Cloudinary.
 * 
 * @param {string} publicId - The public ID of the Cloudinary resource to be deleted.
 * @param {string} [resourceType] - (Optional) Type of resource ('image', 'video', etc.). Defaults to 'image'.
 * @returns {Promise<Object>} - The response from Cloudinary delete operation.
 */
export const deleteResourceFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        console.log(publicId)
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log('deleteResourceFromCloudinary response:', response);
        return response?.result === 'not found' ? false : response;
    } catch (error) {
        console.error('deleteResourceFromCloudinary error:', error);
        throw error;
    }
};

/**
 * Upload a stream to Cloudinary.
 * 
 * @param {stream.Readable} fileBuffer - The buffer to be uploaded.
 * @param {Object} [options] - Optional parameters for the upload (e.g., folder, public_id).
 * @returns {Promise<Object>} - The response from Cloudinary upload operation.
 */
export const uploadStreamToCloudinary = async (fileBuffer, options = {}) => {
    try {
        const stream = new PassThrough();
        return new Promise((resolve, reject) => {
            const cloudinaryUploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) {
                    console.error("Error uploading to Cloudinary:", error);
                    return reject(new Error("Failed to upload to Cloudinary"));
                }
                resolve(result);
            });

            // Stream error handling
            stream.on('error', (error) => {
                console.error("Stream error:", error);
                reject(new Error("Stream error during upload"));
            });

            // Pipe the buffer into the Cloudinary upload stream
            stream.end(fileBuffer);
            stream.pipe(cloudinaryUploadStream);
        });
    } catch (error) {
        console.error("Error in uploadStreamToCloudinary:", error);
        throw new Error("Failed to initiate Cloudinary upload");
    }
};

/**
 * Generate a signed URL for a resource in Cloudinary.
 * 
 * @param {string} filePath - The folder path where the resource is stored.
 * @param {Object} [options] - Optional parameters for transformations (e.g., width, height).
 * @param {number} [expiresIn] - Time in seconds for which the signed URL will be valid. Default is 60 seconds.
 * @returns {string} - The signed URL for accessing the resource.
 */
export const getSignedUrlFromCloudinary = async (filePath, options = {}, expiresIn = 60) => {
    try {
        const publicId = filePath;
        // Generate the signed URL with an expiration time
        const response = await cloudinary.url(publicId, {
            sign_url: true,
            expiration: Math.floor(Date.now() / 1000) + expiresIn, // Set expiration time
        });
        return response;
    } catch (error) {
        console.error("Error generating signed URL from Cloudinary:", error);
        throw new Error("Failed to generate signed URL");
    }
};