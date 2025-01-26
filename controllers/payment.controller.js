const paymentService = require('../services/payment.service');

const createZaloPayOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await paymentService.createZaloPayOrder(orderId);
    res.json(result);
  } catch (error) {
    console.error('Error in createZaloPayOrder:', error);
    res.status(500).json({ 
      status: "500",
      error: error.message 
    });
  }
};

const handleZaloPayCallback = async (req, res) => {
  try {
    const { data, mac } = req.body;
    const result = await paymentService.handleZaloPayCallback(data, mac);
    res.json(result);
  } catch (error) {
    console.error('Error in handleZaloPayCallback:', error);
    res.json({ 
      return_code: 0,
      return_message: error.message 
    });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const { app_trans_id } = req.params;
    const result = await paymentService.getStatusOrder(app_trans_id);
    res.json(result);
  } catch (error) {
    console.error('Error in getOrderStatus:', error);
    res.status(500).json({ 
      status: "500",
      error: error.message 
    });
  }
};

const getAllOrdersStatus = async (req, res) => {
  try {
    const result = await paymentService.getStatusAllOrders();
    res.json(result);
  } catch (error) {
    console.error('Error in getAllOrdersStatus:', error);
    res.status(500).json({ 
      status: "500",
      error: error.message 
    });
  }
};

module.exports = {
  createZaloPayOrder,
  handleZaloPayCallback,
  getOrderStatus,
  getAllOrdersStatus
};
