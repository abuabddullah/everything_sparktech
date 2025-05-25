import crypto from 'crypto';

const cryptoToken = (numb: number = 32) => {
  return crypto.randomBytes(numb).toString('hex');
};

export default cryptoToken;

export function generateCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
