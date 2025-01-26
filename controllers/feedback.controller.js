const nodemailer = require('nodemailer');

const sendFeedback = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      });
    }

    // Cấu hình transporter với Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    // Cấu hình email
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: `Feedback từ ${name}`,
      html: `
        <h3>Thông tin người gửi:</h3>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
        <h3>Nội dung góp ý:</h3>
        <p>${message}</p>
      `
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true,
      message: 'Feedback đã được gửi thành công' 
    });

  } catch (error) {
    console.error('Error sending feedback:', error); // Log lỗi để debug
    res.status(500).json({ 
      success: false,
      message: 'Có lỗi xảy ra khi gửi feedback',
      error: error.message 
    });
  }
};

module.exports = {
  sendFeedback
}; 