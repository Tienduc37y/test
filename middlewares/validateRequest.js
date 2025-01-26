const Joi = require('joi');

const validateRequest = (schema, property = 'body') => {
  return async (req, res, next) => {
    let data = req[property];

    if (typeof data.variants === 'string') {
      try {
        data.variants = JSON.parse(data.variants);
      } catch (error) {
        return res.status(400).json({ error: "Invalid variants data" });
      }
    }

    if (typeof data.category === 'string') {
      try {
        data.category = JSON.parse(data.category);
      } catch (error) {
        return res.status(400).json({ error: "Invalid category data" });
      }
    }

    // Xử lý file ảnh
    if (req.files && req.files.length > 0) {
      data.variants = data.variants.map((variant, index) => ({
        ...variant,
        imageUrl: req.files[index] || variant.imageUrl
      }));
    }

    const { error } = schema.validate(data, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }
    
    next();
  }
}

module.exports = validateRequest;
