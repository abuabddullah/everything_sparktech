import { zfd } from 'zod-form-data';
import { z } from 'zod';

const createOrganizationsZodSchema = zfd.formData({
  name: zfd.text(),
  image: zfd.file().optional(),
  category: zfd.text(),
  locationName: zfd.text(),
  locationCoordinates: zfd.text(),
});

const updateOrganizationsZodSchema = zfd.formData({
  name: zfd.text().optional(),
  image: zfd.file().optional(),
  category: zfd.text().optional(),
  locationName: zfd.text().optional(),
  locationCoordinates: zfd.text().optional(),
});

export const OrganizationsValidation = {
  createOrganizationsZodSchema,
  updateOrganizationsZodSchema,
};
