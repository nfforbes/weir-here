import { auth0 } from './auth0';
import { connectDB } from './mongodb';
import { User, type IUser } from '@/models/User';

export type Persona = 'administrator' | 'user';

export interface AppUser {
  auth0Id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  personas: Persona[];
  _id: string;
}

export async function getAppUser(): Promise<AppUser | null> {
  const session = await auth0.getSession();
  if (!session?.user) return null;

  await connectDB();

  const { sub, email, name, email_verified } = session.user;

  const displayName = (name || email || 'User') as string;
  const verified = (email_verified ?? false) as boolean;

  let dbUser: IUser | null;
  try {
    dbUser = await User.findOneAndUpdate(
      { auth0Id: sub },
      {
        $set: {
          email,
          name: displayName,
          emailVerified: verified,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      dbUser = await User.findOne({ auth0Id: sub });
      if (dbUser) {
        dbUser.email = email;
        dbUser.name = displayName;
        dbUser.emailVerified = verified;
        await dbUser.save();
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  }

  if (!dbUser!.personas?.length) {
    dbUser!.personas = ['user'];
    await dbUser!.save();
  }

  return {
    _id: dbUser!._id.toString(),
    auth0Id: dbUser!.auth0Id,
    email: dbUser!.email,
    name: dbUser!.name,
    emailVerified: dbUser!.emailVerified,
    personas: dbUser!.personas as Persona[],
  };
}
