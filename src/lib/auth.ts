import bcrypt from 'bcryptjs';

export function validatePassword(inputPassword: string): boolean {
  const correctPassword = process.env.APP_PASSWORD;
  if (!correctPassword) {
    throw new Error('APP_PASSWORD environment variable is not set');
  }
  
  // 単純な文字列比較（本番環境ではハッシュ化を推奨）
  return inputPassword === correctPassword;
}

export function hashPassword(password: string): string {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

export function comparePassword(inputPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(inputPassword, hashedPassword);
}
