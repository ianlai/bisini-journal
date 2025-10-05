export const today = () => new Date().toISOString().slice(0, 10);
export const daysInMonth = (y: number, m0: number) => new Date(y, m0 + 1, 0).getDate();
export const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
