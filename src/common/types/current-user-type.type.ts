import { UserRole } from '../../users/enums/user-role.enum';

export type CurrentUserType = {
  id: number;
  email: string;
  role: UserRole;
};
