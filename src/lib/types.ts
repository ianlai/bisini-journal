export type Entry = {
  id: string;          // uuid
  date: string;        // YYYY-MM-DD
  category: string;    // 例如：英文 / 自媒體
  text: string;        // 內容
  done?: boolean;      // 當日是否完成（供 Tracker 使用）
};
