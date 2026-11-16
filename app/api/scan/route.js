// app/api/scan/route.js
import { NextResponse } from 'next/server';
import { processImageOcr } from '@/lib/ocr'; // นำเข้าฟังก์ชัน OCR ของโปรเจกต์

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image'); // รับไฟล์ที่ส่งมาจากหน้า checkout.php

    if (!imageFile) {
      return NextResponse.json({ status: false, error: "กรุณาส่งไฟล์รูปภาพ" }, { status: 400 });
    }

    // แปลงไฟล์เป็น Buffer เพื่อให้โมเดลอ่าน
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // ส่งเข้าโมเดล OpenThai2.0
    const ocrResult = await processImageOcr(buffer);

    return NextResponse.json({
      status: true,
      text: ocrResult.text,     // ข้อความทั้งหมดบนสลิป
      time: ocrResult.timeMs    // เวลาที่ใช้สแกน (ms)
    });

  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json({ status: false, error: "อ่านรูปภาพไม่สำเร็จ" }, { status: 500 });
  }
}