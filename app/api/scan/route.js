// app/api/scan/route.js
import { NextResponse } from 'next/server';
import { extractText } from "../../../lib/ocr/engine.js";

export const runtime = "nodejs";
export const maxDuration = 60; 

// 1. กำหนดค่า CORS อนุญาตให้เว็บอื่นยิง API ข้ามโดเมนมาได้
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // อนุญาตทุกโดเมน (หรือจะเปลี่ยนเป็น "https://gas.in.th" ก็ได้เพื่อความปลอดภัย)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 2. ดักจับคำสั่ง OPTIONS (Preflight Request ที่เบราว์เซอร์ส่งมาเช็กก่อนยิง POST)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 3. ฟังก์ชันสแกนสลิปหลัก
export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { status: false, error: "กรุณาส่งไฟล์รูปภาพ (image) มาด้วยครับ" }, 
        { status: 400, headers: corsHeaders } // คืนค่าพร้อมแนบ Header CORS
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🚀 ส่งภาพเข้าเครื่องยนต์ OpenThai2.0-OCR
    const ocrResult = await extractText(buffer);

    return NextResponse.json({
      status: true,
      text: ocrResult.text || ocrResult,
      time: ocrResult.timeMs || null
    }, { headers: corsHeaders }); // คืนค่าพร้อมแนบ Header CORS

  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ 
      status: false, 
      error: "อ่านรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" 
    }, { status: 500, headers: corsHeaders }); // คืนค่าพร้อมแนบ Header CORS
  }
}