import * as bcrypt from 'bcrypt';

/**
 * Converting plain text password to hashed password
 * @param password plain text password
 * @returns hashed password
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export default hashPassword;
