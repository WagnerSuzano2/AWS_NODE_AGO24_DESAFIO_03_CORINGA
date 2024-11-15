import Joi from 'joi';

const listCarValidator = Joi.object({
  status: Joi.string().valid('active', 'inactive').optional().messages({
    'any.only': 'Status must be active or inactive',
  }),
  plateEnd: Joi.string().optional().trim().messages({
    'string.base': 'Plate end must be a string',
  }),
  brand: Joi.string().optional().trim().messages({
    'string.base': 'Brand must be a string',
  }),
  model: Joi.string().optional().trim().messages({
    'string.base': 'Model must be a string',
  }),
  items: Joi.array().items(Joi.string().trim()).max(5).optional().messages({
    'array.max': 'Cannot have more than 5 items',
  }),
  mileage: Joi.number().min(0).optional().messages({
    'number.base': 'Mileage must be a number',
    'number.min': 'Mileage cannot be negative',
  }),
  yearFrom: Joi.number().optional().messages({
    'number.base': 'Year must be a number',
  }),
  yearTo: Joi.number().min(Joi.ref('yearFrom')).optional().messages({
    'number.base': 'Year must be a number',
    'number.min': 'Year must be greater than or equal to the starting year',
  }),
  dailyPriceMin: Joi.number().min(0).optional().messages({
    'number.base': 'Minimum daily price must be a number',
    'number.min': 'Minimum daily price cannot be negative',
  }),
  dailyPriceMax: Joi.number()
    .min(Joi.ref('dailyPriceMin'))
    .optional()
    .messages({
      'number.base': 'Maximum daily price must be a number',
      'number.min':
        'Maximum daily price must be greater than or equal to the minimum price',
    }),
  sortFields: Joi.string().optional().trim().messages({
    'string.base': 'Sort fields must be a string',
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().messages({
    'any.only': 'Order must be "asc" or "desc"',
  }),
  page: Joi.number().min(1).optional().messages({
    'number.base': 'Page number must be a number',
    'number.min': 'Page number must be at least 1',
  }),
  size: Joi.number().min(1).messages({
    'number.base': 'Size must be a number',
    'number.min': 'Size must be at least 1',
  }),
});

export default listCarValidator;
