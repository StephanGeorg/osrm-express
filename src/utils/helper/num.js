export const getNumber = (num = '') => {
  if (!num) return undefined;
  if (Number(num) === 0) return 0;
  const number = typeof num === 'string' ? num.replace(',', '.') : num;
  if (!Number(number)) return undefined;
  return Number(number);
};

export const isLat = (lat) => Number.isFinite(lat) && Math.abs(lat) <= 90;
export const isLng = (lng) => Number.isFinite(lng) && Math.abs(lng) <= 180;
export const getLat = (lat) => isLat(getNumber(lat)) ? getNumber(lat) : undefined; // eslint-disable-line
export const getLng = (lng) => isLng(getNumber(lng)) ? getNumber(lng) : undefined; // eslint-disable-line