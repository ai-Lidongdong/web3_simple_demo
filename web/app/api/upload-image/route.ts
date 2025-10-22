import { NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';
import { Readable } from 'node:stream'; // 导入 Node 流工具

export async function POST(request: Request) {
  try {
    const pinata = new PinataSDK(
      process.env.PINATA_API_KEY!,
      process.env.PINATA_API_SECRET!
    );

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 转换为 Node.js 可读流
    const webStream = imageFile.stream(); // 获取 Web 流
    const nodeStream = Readable.fromWeb(webStream); // 转换为 Node 流

    // 上传流格式文件
    const uploadResult = await pinata.pinFileToIPFS(nodeStream, {
      pinataMetadata: { name: imageFile.name || `stream-upload-${Date.now()}` }
    });

    return NextResponse.json({
      success: true,
      cid: uploadResult.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`
    });

  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}