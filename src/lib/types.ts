export type Entry = {
  id: string;          // uuid
  date: string;        // YYYY-MM-DD
  categoryId: string;    // 例如：英文 / 自媒體
  text: string;        // 內容
  done?: boolean;      // 當日是否完成（供 Tracker 使用）
};

export type Category = {
  id: string;
  name: string;
  order?: number;
  color?: string;
  archived?: boolean;
};