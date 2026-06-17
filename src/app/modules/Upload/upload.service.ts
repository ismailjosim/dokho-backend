import { v2 as cloudinary } from 'cloudinary';
import HttpStatus from 'http-status';

import { envVars } from '@/config/env.js';
import type { GraphQLContext } from '@/graphql/context.js';
import AppError from '@/helpers/AppError.js';

import { uploadImageValidation } from './upload.validation.js';

function configureCloudinary() {
  const { CLOUD_NAME, API_KEY, API_SECRET } = envVars.CLOUDINARY;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new AppError(
      Number(HttpStatus.SERVICE_UNAVAILABLE),
      'Cloudinary credentials are not configured'
    );
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export const UploadService = {
  async uploadImage(context: GraphQLContext, payload: unknown) {
    if (!context.user) {
      throw new AppError(Number(HttpStatus.UNAUTHORIZED), 'Login required');
    }

    configureCloudinary();
    const data = uploadImageValidation.parse(payload);
    const folder = data.folder === 'NID_DOCUMENTS' ? 'nid-documents' : 'profile-photos';
    const result = await cloudinary.uploader.upload(data.file, {
      folder: `dokho/${folder}`,
      resource_type: 'image',
      overwrite: false,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  },
};
