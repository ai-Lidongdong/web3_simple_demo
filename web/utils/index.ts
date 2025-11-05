
import { IPFS_GATEWAY } from '@/app/constants';

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

// 从 IPFS 或 HTTP 加载 NFT 元数据，根据tokenUri 查询。tokenUri一般是 ipfs:// + 元数据的cid
export const fetchNFTMetadata = async (tokenUri: string) => {
  try {
    // 处理 IPFS 路径（如 ipfs://Qm... 转换为 http 链接）
    const url = tokenUri.startsWith('ipfs://')
      ? `${IPFS_GATEWAY}${tokenUri.slice(7)}`
      : tokenUri;
    const response = await fetch(url);
    if (!response.ok) throw new Error('元数据加载失败');

    const metadata = await response.json();

    // 处理图片的 IPFS 路径
    if (metadata.image?.startsWith('ipfs://')) {
      metadata.image = `${IPFS_GATEWAY}${metadata.image.slice(7)}`;
    }

    return metadata;
  } catch (err) {
    console.error('加载元数据失败:', err);
    return null;
  }
};

export const pathToMenuKey = (currentPath: string): any => {
  // 优先匹配菜单配置中的路径
  const HOME_MENU_PATHS = ['/nft', '/nft/order'];
  const MY_NFT_PATHS = ['/nft/myNft', '/nft/nftDetail', '/nft/addNft'];
  if(HOME_MENU_PATHS.includes(currentPath)){
    return ['/nft'];
  } else if(MY_NFT_PATHS.includes(currentPath)){
    return ['/nft/myNft'];
  }
  return ['/nft']; // 默认返回首页菜单键
};


export const timestampToDate = (timestamp: number) => {
  // 处理秒级时间戳（10位），转换为毫秒级
  if(!timestamp) {
    return '';
  }
  if (timestamp.toString().length === 10) {
    timestamp = timestamp * 1000;
  }

  // 创建Date对象（传入毫秒级时间戳）
  const date = new Date(timestamp);

  // 提取年、月、日（月份从0开始，需+1）
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零（如3月→03）
  const day = String(date.getDate()).padStart(2, '0');

  // 提取时、分、秒
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 组合为YYYY-MM-DD HH:MM:SS格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}