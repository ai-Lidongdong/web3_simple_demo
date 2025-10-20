import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs'; // Node.js 内置模块，用于读取文件

// Pinata 配置（替换为你的 API 密钥）
const PINATA_API_KEY = '10f51560fe8bc9a95375';
const PINATA_API_SECRET = '181197b5e4269b2a24e1431bcaedc11d778aa0a9dc45040d855db15f7690bd6f';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmODFiYTUxNy0wOTBkLTQ1MmYtODg3Ny01ZmMyY2U2ODU4YTkiLCJlbWFpbCI6IjE4MzcwOTU5MTkwQDE2My5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTBmNTE1NjBmZThiYzlhOTUzNzUiLCJzY29wZWRLZXlTZWNyZXQiOiIxODExOTdiNWU0MjY5YjJhMjRlMTQzMWJjYWVkYzExZDc3OGFhMGE5ZGM0NTA0MGQ4NTVkYjE1Zjc2OTBiZDZmIiwiZXhwIjoxNzkyMzE2MzE4fQ.4ufABi8IlR_NcW-radJfHT5QwoNu7TQIf7nv5nk407I'; // 从 Pinata 账号设置中获取

/**
 * 上传图片到 Pinata（IPFS）
 * @param {string} filePath - 本地图片文件路径（如 './images/test.jpg'）
 * @returns {Promise<Object>} - 包含 IPFS 哈希和 URL 的结果
 */
export async function uploadImageToPinata(filePath: any) {
  try {
    // 1. 创建表单数据（包含文件）
    const formData = new FormData();
    // 读取文件并添加到表单（第二个参数为文件名）
    formData.append('file', fs.createReadStream(filePath), {
      filename: filePath.split('/').pop(), // 提取文件名（如 'test.jpg'）
    });

    // 2. 可选：添加元数据（如文件名、描述）
    const metadata = {
      name: 'nft', // 自定义文件名
      keyvalues: {
        description: 'Uploaded via Pinata API', // 自定义描述
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // 3. 可选：配置 Pinata 存储选项（如是否公开）
    const pinOptions = {
      cidVersion: 0, // IPFS CID 版本（0 或 1）
    };
    formData.append('pinataOptions', JSON.stringify(pinOptions));

    // 4. 发送上传请求（v1 接口）
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
          // 若使用 JWT（v2 接口），替换为：Authorization: `Bearer ${PINATA_JWT}`
        },
      }
    );
    console.log('---response', response)
    // 5. 处理返回结果
    const { IpfsHash, PinSize } = response.data;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`; // Pinata 网关 URL
    console.log('上传成功：', {
      ipfsHash: IpfsHash,
      size: PinSize,
      url: ipfsUrl,
    });
    return { ipfsHash: IpfsHash, url: ipfsUrl };

  } catch (error) {
    console.error('上传失败：', error.response?.data || error.message);
    throw new Error('图片上传到 Pinata 失败');
  }
}

