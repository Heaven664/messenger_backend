import { BadRequestException } from '@nestjs/common';
import * as emailValidator from 'email-validator';
import { InputErrorMessages } from 'src/common/enums/errorMessages.enum';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';

/**
 * Checks if the provided user data is valid:
 * - Checks if required fields are missing
 * - Checks if email is valid
 * - Checks if password is at least 6 characters long
 * @throws BadRequestException if the user data is invalid
 * @param userData Initial user data provided by the client
 * @returns void
 
 */
const validateInput = (userData: CreateUserDto) => {
  // Check if required fields are missing
  if (!userData.email || !userData.password || !userData.name) {
    throw new BadRequestException(InputErrorMessages.MISSING_REQUIRED_FIELDS);
  }

  // Validate email
  if (!emailValidator.validate(userData.email)) {
    throw new BadRequestException(InputErrorMessages.INVALID_EMAIL);
  }

  // Validate password length
  const MIN_PASSWORD_LENGTH = 6;
  if (userData.password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestException(InputErrorMessages.SHORT_PASSWORD);
  }
};

export default validateInput;
