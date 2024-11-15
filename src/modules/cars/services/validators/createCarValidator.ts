import Joi from 'joi';
import { CustomHelpers } from 'joi';

function yearValidator() {
  const currentYear = new Date().getFullYear();
  return { minYear: currentYear - 10, maxYear: currentYear + 1 };
}

function uniqueItems(value: string[], helpers: CustomHelpers) {
  const uniqueValues = new Set(value);
  if (uniqueValues.size !== value.length) {
    return helpers.error('any.unique', { message: 'Items must be unique' });
  }
  return value;
}

const createCarValidator = Joi.object({
  plate: Joi.string()
    .replace(/[\s-]/g, '')
    .uppercase()
    .length(7)
    .pattern(/^[A-Za-z]{3}[0-9]{1}[A-Za-z0-9]{1}[0-9]{2}$/)
    .required()
    .messages({
      'string.base': 'Plate must be a string',
      'string.length': 'Plate must have exactly 7 characters',
      'string.pattern.base':
        'The plate must be in the format: 3 letters, 1 number, 1 letter or number, and 2 numbers. [ABC1?23]',
      'any.required': 'Plate is required',
    }),

  brand: Joi.string().trim().min(2).max(45).required().messages({
    'string.base': 'Brand must be a string',
    'string.min': 'Brand must have at least 2 characters',
    'string.max': 'Brand can only have 45 characters',
    'any.required': 'Brand is required',
  }),

  model: Joi.string().trim().min(2).max(90).required().messages({
    'string.base': 'Model must be a string',
    'string.min': 'Model must have at least 2 characters',
    'string.max': 'Model can only have 90 characters',
    'any.required': 'Model is required',
  }),

  mileage: Joi.number().integer().messages({
    'number.base': 'Mileage must be a number',
    'number.integer': 'Mileage must be an integer',
  }),

  year: Joi.number()
    .integer()
    .min(yearValidator().minYear)
    .max(yearValidator().maxYear)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': `Year must be at least ${yearValidator().minYear}`,
      'number.max': `Year must not exceed ${yearValidator().maxYear}`,
      'any.required': 'Year is required',
    }),

  items: Joi.array()
    .items(Joi.string().trim().lowercase())
    .custom(uniqueItems)
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'Cars must have at least 1 item',
      'array.max': 'Cars can only have 5 items',
      'any.required': 'Items are required',
    }),

  daily_price: Joi.number().required().messages({
    'number.base': 'Daily price must be a number',
    'any.required': 'Daily price is required',
  }),

  status: Joi.string()
    .trim()
    .lowercase()
    .valid('active', 'inactive')
    .required()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: active or inactive',
      'any.required': 'Status is required',
    }),
});

export default createCarValidator;