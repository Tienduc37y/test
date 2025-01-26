const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const orderService = require('../services/order.service');
const Order = require('../models/order.model');
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};


const createZaloPayOrder = async (orderId) => {
  try {
    const orderInfo = await orderService.findOrderById(orderId);
    
    if (!orderInfo) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    const items = orderInfo.orderItems.map(item => ({
      item_id: item.product._id.toString(),
      item_name: item.product.name,
      item_price: Math.round(item.product.discountedPrice),
      item_quantity: item.quantity
    }));

    // Tạo embed_data là JSON string
    const embed_data = JSON.stringify({
      redirecturl: `${process.env.FE_URL}/account/order`,
      orderId: orderId
    });

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${orderId}`, 
      app_user: orderInfo.user.username,
      app_time: Date.now(),
      expire_duration_seconds: 300,
      item: JSON.stringify(items),
      embed_data: embed_data,
      amount: orderInfo.totalDiscountedPrice,
      callback_url: 'https://e-commerce-fashion-eosin.vercel.app/api/payment/zalopay-callback',
      description: `Thanh toán cho đơn hàng #${orderId}`,
      bank_code: "",
    };

    // Tạo chuỗi MAC theo đúng thứ tự
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + 
                order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();


    // Gọi API ZaloPay
    const response = await axios.post(config.endpoint, null, { params: order });

    // Cập nhật appTransactionId trong database
    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          "paymentDetails.appTransactionId": order.app_trans_id
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating ZaloPay order:', error.message);
    if (error.response) {
      console.error('ZaloPay API error response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

const handleZaloPayCallback = async (reqData, reqMac) => {
  let result = {}
  try {
    let mac = CryptoJS.HmacSHA256(reqData, config.key2).toString();
    if (mac !== reqMac) {
      result.return_code = -1
      result.return_message = "Mac không khớp"
    }
    else {
      let dataJson = JSON.parse(reqData)
      const orderId = dataJson.app_trans_id.split('_')[1]
      let paymentStatus = "Đang chờ thanh toán"
      let statusMessage = "Trạng thái đang chờ thanh toán"
      let orderStatus = "Đặt hàng thành công"
      let isProcessing = "Chưa xử lý"

      if(dataJson.zp_trans_id) {
        paymentStatus = "Đã thanh toán"
        statusMessage = "Thanh toán thành công"
        orderStatus = "Đã thanh toán"
        isProcessing = "Đã xử lý"
      }
      const order = await Order.findOneAndUpdate(
        {_id: orderId},
        {
          $set: {
            "paymentDetails.statusMessage": statusMessage,
            "paymentDetails.paymentStatus": paymentStatus,
            "paymentDetails.zalopayTransactionId": dataJson.zp_trans_id,
            "paymentDetails.isProcessing": isProcessing,
            "orderStatus": orderStatus
          }
        },
        {new: true}
      )

      if(order) {
        result.return_code = 1
        result.return_message = "Thanh toán thành công"
      }
      else {
        result.return_code = 0
        result.return_message = "Không tìm thấy đơn hàng"
      }
    }
  } catch (error) {
    result.return_code = 0
    result.return_message = error.message
  }
  return result
}

const getZaloPayStatus = async (app_trans_id) => {
  const postData = {
    app_id: config.app_id,
    app_trans_id,
  };

  const data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1;
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  const postConfig = {
    method: 'post',
    url: 'https://sb-openapi.zalopay.vn/v2/query',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify(postData),
  };

  try {
    const response = await axios(postConfig);
    return response.data;
  } catch (error) {
    console.error('Error checking order status:', error);
    throw error;
  }
};

const getStatusOrder = async (app_trans_id) => {
  try {
    const response = await getZaloPayStatus(app_trans_id)
    const {
      return_code,
      return_message,
      sub_return_code,
      sub_return_message,
      zp_trans_id,
      is_processing,
    } = response

    const orderId = app_trans_id.split('_')[1]
    let paymentStatus
    let statusMessage
    let isProcessing
    let orderStatus

    switch(return_code) {
      case 1:
        paymentStatus = "Đã thanh toán"
        statusMessage = "Thanh toán thành công"
        isProcessing = "Đã xử lý"
        orderStatus = "Đã thanh toán"
        break;
        
      case 2:
        paymentStatus = "Lỗi thanh toán"
        statusMessage = "Thanh toán thất bại"
        isProcessing = "Đã xử lý"
        orderStatus = "Đã hủy"
        break;
        
      case 3:
        if(is_processing) {
          paymentStatus = "Đang trong quá trình thanh toán"
          statusMessage = "Đang trong quá trình thanh toán"
          isProcessing = "Đang xử lý"
          orderStatus = "Đang chờ xử lý"
        } else {
          paymentStatus = "Chưa thanh toán"
          statusMessage = "Đơn hàng chưa thanh toán"
          isProcessing = "Chưa xử lý"
          orderStatus = "Đang chờ xử lý"
        }
        break;
        
      default:
        paymentStatus = "Lỗi thanh toán"
        statusMessage = "Thanh toán thất bại"
        isProcessing = "Đã xử lý"
        orderStatus = "Đã hủy"
    }

    const order = await Order.findOneAndUpdate(
      {_id: orderId},
      {
        $set: {
          "paymentDetails.paymentStatus": paymentStatus,
          "paymentDetails.statusMessage": statusMessage,
          "paymentDetails.zalopayTransactionId": zp_trans_id,
          "paymentDetails.subReturnCode": sub_return_code,
          "paymentDetails.subReturnMessage": sub_return_message,
          "paymentDetails.isProcessing": isProcessing,
          orderStatus
        }
      },
      {new: true}
    ).populate('user').populate({
      path: 'orderItems',
      populate: {
        path: 'product'
      }
    }).populate('promotion')

    if(order) {
      return order
    }
    else {
      throw new Error("Không tìm thấy đơn hàng")
    }
  } catch (error) {
    console.error('Error checking order status:', error)
    throw error
  }
}

const getStatusAllOrders = async () => {
  try {
    // Lấy tất cả các đơn hàng có appTransactionId và chưa hoàn thành
    const orders = await Order.find({
      "paymentDetails.appTransactionId": { $ne: null },
      "orderStatus": { $ne: "Đã hoàn thành" }
    });

    // Kiểm tra trạng thái từng đơn hàng
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          return await getStatusOrder(order.paymentDetails.appTransactionId);
        } catch (error) {
          console.error(`Error checking order ${order._id}:`, error);
          return null;
        }
      })
    );

    // Lọc bỏ các giá trị null nếu có lỗi
    return updatedOrders.filter(order => order !== null);
    
  } catch (error) {
    console.error('Error checking all orders status:', error);
    throw error;
  }
};

module.exports = {
  createZaloPayOrder,
  handleZaloPayCallback,
  getZaloPayStatus,
  getStatusOrder,
  getStatusAllOrders
};
