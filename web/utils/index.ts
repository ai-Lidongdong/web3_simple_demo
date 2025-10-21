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