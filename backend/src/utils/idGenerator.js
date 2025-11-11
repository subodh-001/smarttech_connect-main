import crypto from 'crypto';

const padSegment = (value, length) => value.toString().padStart(length, '0');

export const generateReadableId = (prefix = 'ID') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSegment = crypto.randomBytes(3).toString('hex').toUpperCase();
  const shortStamp = padSegment(timestamp, 6).slice(-6);
  return `${prefix}-${shortStamp}-${randomSegment}`;
};

export default generateReadableId;
