import service from "./index";

/**
 * GET 请求
 * @param {string} url - 接口地址
 * @param {Object} params - 请求参数（会拼在 URL 上）
 * @param {Object} config - 额外配置（如 headers）
 */
export const fetchApi = (url, params = {}, config = {}) => {
  return service({
    method: "get",
    url,
    params,
    ...config
  });
};
