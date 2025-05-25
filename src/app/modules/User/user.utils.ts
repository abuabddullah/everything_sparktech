
import { User } from './user.model';

export function cleanObject<T extends object>(
  obj: T,
  excludeKeys: (keyof T)[] = []
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) => value != null && !excludeKeys.includes(key as keyof T)
    )
  ) as Partial<T>;
}



// Admin ID
export const findLastAdminId = async () => {
  const lastAdmin = await User.findOne(
    {
      role: 'admin',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastAdmin?.id ? lastAdmin.id.substring(2) : undefined;
};

export const generateAdminId = async () => {
  let currentId = (0).toString();
  const lastAdminId = await findLastAdminId();

  if (lastAdminId) {
    currentId = lastAdminId.substring(2);
  }

  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

  incrementId = `A-${incrementId}`;
  return incrementId;
};
