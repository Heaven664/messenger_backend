import { v4 as uuidv4 } from 'uuid';
import { InitialUserData, User } from '../interfaces/user.interface';
import hashPassword from './password.factory';

/**
 * Validates user input and creates a new user object
 * @param userData Initial user data provided by the client
 * @returns User object with all required properties
 */
export const createUser = async (userData: InitialUserData): Promise<User> => {
  // Destructure name and email from form data
  const { name, email, password } = userData as InitialUserData;

  // Create unique id
  const id = uuidv4();

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Set other properties to default values
  const imageSrc = null;
  const residency = null;
  const lastSeenPermission = true;
  const lastSeenTime = null;

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
