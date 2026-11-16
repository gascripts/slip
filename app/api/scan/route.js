// app/api/scan/route.js
import { NextResponse } from 'next/server';
import { extractText } from "../../../lib/ocr/engine.js";

// กำหนดให้ Vercel อนุญาตให้รันโค้ดนี้นานสูงสุด 60 วินาที (เผื่อสลิปอ่านยาก)
export const runtime = "nodejs";
export const maxDuration = 60; 

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image'); // รับไฟล์จากหน้าเว็บเรา (market_checkout.php)

    if (!imageFile) {
      return NextResponse.json({ status: false, error: "กรุณาส่งไฟล์รูปภาพ (image) มาด้วยครับ" }, { status: 400 });
    }

    // แปลงไฟล์ภาพที่ได้มาเป็น Buffer เพื่อป้อนให้ AI อ่าน
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🚀 ส่งภาพเข้าเครื่องยนต์ OpenThai2.0-OCR
    const ocrResult = await extractText(buffer);

    // ส่งข้อความกลับไปให้หน้าเว็บ PHP ของเรา
    return NextResponse.json({
      status: true,
      text: ocrResult.text || ocrResult, // ข้อความที่อ่านได้บนสลิป
      time: ocrResult.timeMs || null     // เวลาประมวลผล (ถ้ามี)
    });

  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ 
      status: false, 
      error: "อ่านรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" 
    }, { status: 500 });
  }
}