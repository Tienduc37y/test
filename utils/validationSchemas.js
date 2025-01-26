const Joi = require('joi');

const schemas = {
  userRegister: Joi.object({
    firstName: Joi.string().required().messages({
      'string.empty': 'Họ không được để trống',
      'any.required': 'Họ là bắt buộc'
    }),
    lastName: Joi.string().required().messages({
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên là bắt buộc'
    }),
    username: Joi.string().min(6).required().messages({
      'string.empty': 'Tên đăng nhập không được để trống',
      'string.min': 'Tên đăng nhập phải có ít nhất {#limit} ký tự',
      'any.required': 'Tên đăng nhập là bắt buộc'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().min(6).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).required().messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất một chữ cái và một số',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
    mobile: Joi.string().pattern(/^[0-9]{10,12}$/).required().messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại phải có từ 10 đến 12 chữ số',
      'any.required': 'Số điện thoại là bắt buộc'
    })
  }),

  userLogin: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Tên đăng nhập không được để trống',
      'any.required': 'Tên đăng nhập là bắt buộc'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    })
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().min(6).required().messages({
      'string.empty': 'Mật khẩu cũ không được để trống',
      'string.min': 'Mật khẩu cũ phải có ít nhất {#limit} ký tự',
      'any.required': 'Mật khẩu cũ là bắt buộc'
    }),
    newPassword: Joi.string().min(6).pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).required().messages({
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu mới phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu mới phải chứa ít nhất một chữ cái và một số',
      'any.required': 'Mật khẩu mới là bắt buộc'
    })
  }),

  getResetToken: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    })
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    token: Joi.string().required().messages({
      'string.empty': 'Token không được để trống',
      'any.required': 'Token là bắt buộc'
    })
  }),

  editUser: Joi.object({
    firstName: Joi.string().messages({
      'string.empty': 'Họ không được để trống'
    }),
    lastName: Joi.string().messages({
      'string.empty': 'Tên không được để trống'
    }),
    email: Joi.string().email().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ'
    }),
    mobile: Joi.string().pattern(/^[0-9]{10,12}$/).messages({
      'string.empty': 'Số điện thoại không được để trống',
      'string.pattern.base': 'Số điện thoại phải có từ 10 đến 12 chữ số'
    }),
    role: Joi.string().messages({
      'string.empty': 'Vai trò không được để trống'
    })
  }).min(1).messages({
    'object.min': 'Phải có ít nhất một trường được cập nhật'
  }),

  createProduct: Joi.object({
    title: Joi.string().required().messages({
      'string.empty': 'Tiêu đề sản phẩm không được để trống',
      'any.required': 'Tiêu đề sản phẩm là bắt buộc'
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Mô tả sản phẩm không được để trống',
      'any.required': 'Mô tả sản phẩm là bắt buộc'
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'Giá phải là một số',
      'number.positive': 'Giá phải là số dương',
      'any.required': 'Giá sản phẩm là bắt buộc'
    }),
    discountedPrice: Joi.number().positive().max(Joi.ref('price')).messages({
      'number.base': 'Giá khuyến mãi phải là một số',
      'number.positive': 'Giá khuyến mãi phải là số dương',
      'number.max': 'Giá khuyến mãi không được lớn hơn giá gốc'
    }),
    discountedPersent: Joi.number().min(0).max(100).messages({
      'number.base': 'Phần trăm giảm giá phải là một số',
      'number.min': 'Phần trăm giảm giá không được nhỏ hơn 0',
      'number.max': 'Phần trăm giảm giá không được lớn hơn 100'
    }),
    quantity: Joi.number().integer().min(0).required().messages({
      'number.base': 'Số lượng phải là một số nguyên',
      'number.integer': 'Số lượng phải là một số nguyên',
      'number.min': 'Số lượng không được nhỏ hơn 0',
      'any.required': 'Số lượng sản phẩm là bắt buộc'
    }),
    brand: Joi.string().messages({
      'string.empty': 'Thương hiệu không được để trống'
    }),
    variants: Joi.array().items(Joi.object({
      color: Joi.string().required().messages({
        'string.empty': 'Màu sắc không được để trống',
        'any.required': 'Màu sắc là bắt buộc'
      }),
      nameColor: Joi.string().required().messages({
        'string.empty': 'Tên màu sắc không được để trống',
        'any.required': 'Tên màu sắc là bắt buộc'
      }),
      imageUrl: Joi.alternatives().try(
        Joi.string().uri().messages({
          'string.uri': 'URL ảnh không hợp lệ'
        }),
        Joi.object().messages({
          'object.base': 'File ảnh không hợp lệ'
        })
      ).required().messages({
        'any.required': 'Ảnh là bắt buộc'
      }),
      sizes: Joi.array().items(Joi.object({
        size: Joi.string().required().messages({
          'string.empty': 'Kích thước không được để trống',
          'any.required': 'Kích thước là bắt buộc'
        }),
        quantityItem: Joi.number().integer().min(0).required().messages({
          'number.base': 'Số lượng phải là một số nguyên',
          'number.integer': 'Số lượng phải là một số nguyên',
          'number.min': 'Số lượng không được nhỏ hơn 0',
          'any.required': 'Số lượng là bắt buộc'
        })
      })).min(1).required().messages({
        'array.min': 'Phải có ít nhất một kích thước cho mỗi biến thể',
        'any.required': 'Danh sách kích thước là bắt buộc'
      })
    })).min(1).required().messages({
      'array.min': 'Phải có ít nhất một biến thể',
      'any.required': 'Danh sách biến thể là bắt buộc'
    }),
    category: Joi.object({
      topLevelCategory: Joi.string().required().messages({
        'string.empty': 'Danh mục cấp 1 không được để trống',
        'any.required': 'Danh mục cấp 1 là bắt buộc'
      }),
      secondLevelCategory: Joi.string().required().messages({
        'string.empty': 'Danh mục cấp 2 không được để trống',
        'any.required': 'Danh mục cấp 2 là bắt buộc'
      }),
      thirdLevelCategory: Joi.string().required().messages({
        'string.empty': 'Danh mục cấp 3 không được để trống',
        'any.required': 'Danh mục cấp 3 là bắt buộc'
      })
    }).required().messages({
      'any.required': 'Thông tin danh mục là bắt buộc'
    })
  }).custom((value, helpers) => {
    const totalQuantityItems = value.variants.reduce((sum, variant) => 
      sum + variant.sizes.reduce((sizeSum, size) => sizeSum + size.quantityItem, 0), 0
    );
    if (totalQuantityItems > value.quantity) {
      return helpers.error('custom.quantityExceeded');
    }
    return value;
  }, 'Kiểm tra tổng số lượng các sản phẩm').message({
    'custom.quantityExceeded': 'Tổng số lượng của các sản phẩm không được vượt quá số lượng tổng của sản phẩm'
  }),

  updateProduct: Joi.object({
    title: Joi.string().messages({
      'string.empty': 'Tiêu đề sản phẩm không được để trống'
    }),
    description: Joi.string().messages({
      'string.empty': 'Mô tả sản phẩm không được để trống'
    }),
    price: Joi.number().positive().messages({
      'number.base': 'Giá phải là một số',
      'number.positive': 'Giá phải là số dương'
    }),
    discountedPrice: Joi.number().positive().max(Joi.ref('price')).messages({
      'number.base': 'Giá khuyến mãi phải là một số',
      'number.positive': 'Giá khuyến mãi phải là số dương',
      'number.max': 'Giá khuyến mãi không được lớn hơn giá gốc'
    }),
    discountedPersent: Joi.number().min(0).max(100).messages({
      'number.base': 'Phần trăm giảm giá phải là một số',
      'number.min': 'Phần trăm giảm giá không được nhỏ hơn 0',
      'number.max': 'Phần trăm giảm giá không được lớn hơn 100'
    }),
    quantity: Joi.number().integer().min(0).messages({
      'number.base': 'Số lượng phải là một số nguyên',
      'number.integer': 'Số lượng phải là một số nguyên',
      'number.min': 'Số lượng không được nhỏ hơn 0'
    }),
    brand: Joi.string().messages({
      'string.empty': 'Thương hiệu không được để trống'
    }),
    variants: Joi.array().items(Joi.object({
      color: Joi.string().messages({
        'string.empty': 'Màu sắc không được để trống'
      }),
      nameColor: Joi.string().messages({
        'string.empty': 'Tên màu sắc không được để trống'
      }),
      imageUrl: Joi.alternatives().try(
        Joi.string().allow(''),
        Joi.object()
      ).messages({
        'alternatives.types': 'Ảnh phải là URL hoặc file hợp lệ'
      }),
      sizes: Joi.array().items(Joi.object({
        size: Joi.string().messages({
          'string.empty': 'Kích thước không được để trống'
        }),
        quantityItem: Joi.number().integer().min(0).messages({
          'number.base': 'Số lượng phải là một số nguyên',
          'number.integer': 'Số lượng phải là một số nguyên',
          'number.min': 'Số lượng không được nhỏ hơn 0'
        })
      }))
    })),
    category: Joi.object({
      topLevelCategory: Joi.string().messages({
        'string.empty': 'Danh mục cấp 1 không được để trống'
      }),
      secondLevelCategory: Joi.string().messages({
        'string.empty': 'Danh mục cấp 2 không được để trống'
      }),
      thirdLevelCategory: Joi.string().messages({
        'string.empty': 'Danh mục cấp 3 không được để trống'
      })
    })
  }).custom((value, helpers) => {
    if (value.variants) {
      const totalQuantityItems = value.variants.reduce((sum, variant) => 
        sum + (variant.sizes ? variant.sizes.reduce((sizeSum, size) => sizeSum + (size.quantityItem || 0), 0) : 0), 0
      );
      if (value.quantity !== undefined && totalQuantityItems > value.quantity) {
        return helpers.error('custom.quantityExceeded');
      }
    }
    return value;
  }, 'Kiểm tra tổng số lượng các sản phẩm').message({
    'custom.quantityExceeded': 'Tổng số lượng của các sản phẩm không được vượt quá số lượng tổng của sản phẩm'
  })
};

module.exports = schemas;
