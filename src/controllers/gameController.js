const dataService = require("../services/dataService");

const handleRequest = async (req, res) => {
  // Lấy dữ liệu từ Postman/Frontend
  const { full_name, phone, form_type } = req.body;

  // Validate cơ bản
  if (!full_name || !phone || !form_type) {
    return res.status(400).json({ 
      success: false, 
      message: "Vui lòng cung cấp ít nhất: full_name, phone, form_type" 
    });
  }

  try {
    const result = await dataService.pushToPlatforms(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = { handleRequest };