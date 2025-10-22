'use client'; // 标记为客户端组件（需使用状态和事件）

import { useState } from 'react';
import { Button, message } from 'antd';
import styles from './index.module.css'
interface UploadResponse {
  cid: string,
  success: boolean,
  url: string,
}

export default function UploadPage({ feedback }) {
  // 状态管理
  const [selectedFile, setSelectedFile] = useState(null); // 已上传文件
  const [isUploading, setIsUploading] = useState(false); // 上传文件中
  const [result, setResult] = useState(null); // 上传返回结果
  const [error, setError] = useState('');
  const [messageApi] = message.useMessage();

  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(''); // 清除错误
      setResult(null); // 清除历史结果
    }
  };

  // 处理上传
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择一张图片');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      // 构建 FormData
      const formData = new FormData();
      formData.append('image', selectedFile); // 字段名与后端一致

      // 调用后端 API
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      const data: UploadResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      // 保存结果
      setResult(data);
      feedback(data)
      messageApi.open({
        key: 'updatable',
        type: 'success',
        content: 'The upload was successful',
        duration: 2,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.upload_wrap}>
      <div  className={styles.file_upload}>
        <input
          type="file"
          className={styles.file_input}
          accept="image/*"
          onChange={handleFileChange}
        />
        <Button
          type='primary'
          className={styles.upload_but}
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
        >
        {isUploading ? '上传中...' : '上传Pinata'}
      </Button>

      </div>

        {/* {selectedFile && (
          <p>
            已选择：{selectedFile.name}（{Math.round(selectedFile.size / 1024)} KB）
          </p>
        )} */}

      {/* 成功结果 */}
      {result && (
        <div className={styles.result_box}>
          <div className={styles.result_item}>IPFS CID: <span>{result.cid}</span></div>
          <div className={`${styles.result_item} single_line`}>访问链接: <span><a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.url}
            </a></span>
          </div>
          <div className={styles.result_item}>图片预览: 
            <img
              src={result.url}
              className={styles.nft_img}
              alt="上传预览"
            />
          </div>
        </div>
      )}
    </div>
  );
}
//   marginTop: '2rem',
//   padding: '1.5rem',
//   border: '1px solid #dcfce7',
//   borderRadius: '4px',
//   backgroundColor: '#f0fdf4'
// };

// const linkStyle = {
//   color: '#0ea5e9',
//   marginLeft: '0.5rem',
//   wordBreak: 'break-all'
// };

// const previewStyle = {
//   marginTop: '1rem'
// };

// const imageStyle = {
//   maxWidth: '100%',
//   borderRadius: '4px',
//   marginTop: '0.5rem',
//   boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
// };