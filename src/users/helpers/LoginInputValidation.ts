import { BadRequestException } from '@nestjs/common';
import * as emailValidator from 'email-validator';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';
import { LoginUserDto } from 'src/shared/dto/create-user.dto';

/**
 * Checks if the provided login data is valid:
 * - Checks if required fields are missing
 * - Checks if password is at least 6 characters long
 * @throws BadRequestException if the login data is invalid
 * @param userData Login data provided by the client
 * @returns void
 
 */
const validateLoginInput = (userData: LoginUserDto) => {
  // Check if required fields are missing
  if (!userData.email || !userData.password) {
    throw new BadRequestException(InputErrorMessages.MISSING_REQUIRED_FIELDS);
  }

  // Validate email
  if (!emailValidator.validate(userData.email)) {
    throw new BadRequestException(InputErrorMessages.INVALID_CREDENTIALS);
  }
};

export default validateLoginInput;
