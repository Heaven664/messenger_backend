import { v4 as uuidv4 } from 'uuid';
import { User } from '../interfaces/user.interface';
import hashPassword from './password.factory';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';

/**
 * Validates user input and creates a new user object
 * @param userData Initial user data provided by the client
 * @returns User object with all required properties
 */
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  // Destructure name and email from form data
  const { name, email, password } = userData;

  // Create unique id
  const id = uuidv4();

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Set other properties to default values
  const imageSrc = `/images/default-profile-image.webp`;
  const residency = null;
  const lastSeenPermission = true;
  const lastSeenTime = new Date().getTime();

  // Create new user object
  const user: User = {
    id,
    name,
    email,
    imageSrc,
    residency,
    lastSeenPermission,
    lastSeenTime,
    password: hashedPassword,
  };

  return user;
};

export default createUser;
