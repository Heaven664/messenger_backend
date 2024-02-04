import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';

/**
 * Compares provided password with the hashed password from database and throws an error if they don't match
 * @param password user provided plain password
 * @param hashedPassword hashed password from database
 * @throws BadRequestException if the password does not match the hashed password
 * @returns void
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  const match = await bcrypt.compare(password, hashedPassword);
  if (!match) {
    throw new BadRequestException(InputErrorMessages.INVALID_CREDENTIALS);
  }
};
