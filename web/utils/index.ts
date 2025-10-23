// 函数：获取指定名称的 Cookie 值
export const getCookie = (name: any) => {
  // 拼接分隔符，避免匹配到包含目标名称的键（如 'username' 和 'user'）
  const cookieStr = `; ${document.cookie}`;
  const parts = cookieStr.split(`; ${name}=`);

  // 若存在该 Cookie，返回解码后的值
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }

  // 不存在则返回 null 或空字符串
  return null;
}


export const onUploadJsonToPinata = async (data: any) => {
  try {
    // check this data is object or not
    if (typeof data !== 'object') {
      return null;
    }
    const formData = new FormData();
    const json = JSON.stringify(data)
    const blob = new Blob([json]);
    const file = new File([blob], "bob.json", { type: "application/json" });
    formData.append("file", file);
    formData.append("network", "public");
    // '/pinata' has been proxied
    const request = await fetch("/pinata/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: formData,
    });
    const response = await request.json();
    return response?.data || {};
  } catch (error) {
    console.log('upload error：', error);
    return null
  }
}