'use server';

import { db } from '@/lib/db';
import { createSession, deleteSession, getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export interface FormState {
  error?: string;
  success?: boolean;
}

export async function registerStudentAction(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'Email already registered.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            loyaltyPoints: 0,
          },
        },
      },
      include: {
        student: true,
      },
    });

    if (user.student) {
      await createSession(user.id, user.role, user.student.id);
    }

    // Success redirect is handled outside or we can redirect directly
  } catch (err) {
    console.error('Registration error:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  redirect('/menu');
}

export async function loginAction(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  let user;
  try {
    user = await db.user.findUnique({
      where: { email },
      include: {
        student: true,
        staff: true,
      },
    });

    if (!user) {
      return { error: 'Invalid email or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: 'Invalid email or password.' };
    }

    const studentId = user.student?.id;
    const staffId = user.staff?.id;

    await createSession(user.id, user.role, studentId, staffId);
  } catch (err) {
    console.error('Login error:', err);
    return { error: 'An unexpected error occurred.' };
  }

  // Redirect based on role
  if (user.role === 'ADMIN') {
    redirect('/admin');
  } else if (user.role === 'STAFF') {
    redirect('/kitchen');
  } else {
    redirect('/menu');
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/');
}

export async function getAuthedUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: {
          select: {
            id: true,
            loyaltyPoints: true,
            qrEntryToken: true,
          },
        },
        staff: {
          select: {
            id: true,
            isAvailable: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}
