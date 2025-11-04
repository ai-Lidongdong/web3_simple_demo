'use client'; // 标记为客户端组件（需使用状态和事件）

import { useState } from 'react';
import { Button, message } from 'antd';
import styles from './index.module.css'
interface UploadResponse {
  cid: string,
  success: boolean,
  url: string,
  ok?: boolean
}

export default function UploadPage({ feedback, setLoading }: {
  feedback: Function
  setLoading: Function
}) {
  // 状态管理
  const [result, setResult] = useState(null); // 上传返回结果

  // handle file
  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      try{
        setLoading('上传中~');
      // 构建 FormData
      const formData = new FormData();
      formData.append('image', file); // 字段名与后端一致
      // 调用后端 API
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      const data: UploadResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || '上传失败');
      }

      // 保存结果
      setResult(data);
      feedback(data)
      setLoading('');

      }catch(err) {
      setLoading('');

      }
    }
  };

  return (
    <div className={styles.upload_wrap}>
      <div className={styles.upload_img}>
        <div className={styles.img}>
          <input
            type="file"
            className={styles.img_input}
            accept="image/*"
            onChange={handleFileChange}
          />
          {result && <img className={styles.img_url} src={result.url}/>}
          <img className={styles.upload_icon} src='/upload_x.png'/>
          <span>Upload</span>
        </div>
      </div>

      {/* 成功结果 */}

    </div>
  );
}
