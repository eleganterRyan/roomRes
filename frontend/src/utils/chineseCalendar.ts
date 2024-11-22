import dayjs from 'dayjs';
import { Solar } from 'lunar-javascript';

export const getDateInfo = (date: dayjs.Dayjs) => {
  const solar = Solar.fromYmd(date.year(), date.month() + 1, date.date());
  const lunar = solar.getLunar();
  
  let specialDay = '';
  
  // 获取节气
  const term = lunar.getJieQi();
  if (term) {
    specialDay = term;
  }
  
  // 获取农历节日
  const lunarFestival = lunar.getFestivals();
  if (lunarFestival.length > 0) {
    specialDay = lunarFestival[0];
  }
  
  // 获取公历节日
  const solarFestival = solar.getFestivals();
  if (solarFestival.length > 0) {
    specialDay = solarFestival[0];
  }
  
  return specialDay;
}; 