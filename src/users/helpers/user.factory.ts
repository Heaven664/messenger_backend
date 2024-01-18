import { v4 as uuidv4 } from 'uuid';
import { InitialUserData, User } from '../interfaces/user.interface';

export const createUser = (userData: InitialUserData): User => {
  // Destructure name and email from form data
  const { name, email, password } = userData as InitialUserData;

  // Create unique id
  const id = uuidv4();

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
    password,
    imageSrc,
    residency,
    lastSeenPermission,
    lastSeenTime,
  };

  return user;
};

export default createUser;
