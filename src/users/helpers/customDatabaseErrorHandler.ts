import { BadRequestException } from '@nestjs/common';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';

/**
 * Takes error code from database and throws appropriate error
 * @param errorCode error code from database
 * @throws BadRequestException
 */
export const resolveDatabaseError = (errorCode: number) => {
  if (errorCode === 11000) {
    throw new BadRequestException(InputErrorMessages.USER_ALREADY_EXISTS);
  }
  throw new BadRequestException('Registration failed');
};
