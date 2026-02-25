export default {
    // 存储在本地的方法
    get(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      // 关键点：取出时尝试解析 JSON
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  },
    set: (key: string, value: unknown) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key: string) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    },
}