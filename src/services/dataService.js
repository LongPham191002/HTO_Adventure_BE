const axios = require("axios");
const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const pushToPlatforms = async (userData) => {
  try {
    // --- 1. GOOGLE SHEETS (Giữ nguyên vì đã chạy tốt) ---
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const targetTabName = (userData.form_type || "visa").toLowerCase().trim();
    const sheet = doc.sheetsByIndex.find(s => s.title.toLowerCase().trim() === targetTabName);

    if (!sheet) throw new Error(`Không tìm thấy Tab '${targetTabName}'`);

    await sheet.addRow({
      "Thời gian": new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      "Họ Tên": userData.full_name || "",
      "SĐT": userData.phone ? `'${userData.phone}` : "",
      "Email": userData.email || "",
      "Điểm số": userData.score || 0,
      "Quà tặng": userData.gift_name || "",
      "Nguồn": userData.form_type === "visa" ? "Đánh giá Visa" : "HITO_Game",
    });

    console.log("✅ [Google Sheet] Đã lưu dữ liệu thành công.");

    // --- 2. BIZFLY CRM (Sửa Payload để khớp với Webhook API trực tiếp) ---
    try {
      const webhookUrl = (process.env.BIZFLY_WEBHOOK_URL || "").trim();
      
      if (webhookUrl && webhookUrl.startsWith("http")) {
        // Bizfly Public API yêu cầu các trường này để hiện lên danh sách
        const bizflyPayload = {
          "full_name": userData.full_name,
          "phone": userData.phone,
          "email": userData.email || "",
          "source": userData.form_type === "visa" ? "Zalo_App_Visa" : "Zalo_App_HITO_Game",
          "content": `Quà: ${userData.gift_name || "Không"} | Điểm: ${userData.score || 0}`,
          "overwrite": 1 // Cập nhật nếu trùng số điện thoại để không bị lỗi 400
        };

        console.log("⏳ [Bizfly CRM] Đang bắn trực tiếp vào CRM...");

        // Dùng await để kiểm tra phản hồi ngay lập tức cho chắc chắn
        const response = await axios.post(webhookUrl, bizflyPayload, { timeout: 10000 });
        console.log("✅ [Bizfly CRM] Phản hồi từ Server:", response.data.message || "OK");
      }
    } catch (crmError) {
      console.error("⚠️ [Bizfly CRM] Lỗi:", crmError.response ? crmError.response.data : crmError.message);
    }

    return { success: true };

  } catch (error) {
    console.error("❌ [Hệ thống] Lỗi nghiêm trọng:", error.message);
    throw error;
  }
};

module.exports = { pushToPlatforms };