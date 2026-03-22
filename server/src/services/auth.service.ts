import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, organizations, sessions } from '../db/schema.js';
import { env } from '../config.js';
import type { RegisterInput, LoginInput, User, AuthResponse } from '@sme-insightx/shared';

function generateToken(user: { id: string; email: string; role: string; organizationId: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toUserResponse(user: typeof users.$inferSelect): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as User['role'],
    organizationId: user.organizationId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: input.organizationName,
      slug: slugify(input.organizationName),
    })
    .returning();

  // Create user as org owner
  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
      role: 'owner',
      organizationId: org.id,
    })
    .returning();

  const token = generateToken(user);

  // Store session
  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { user: toUserResponse(user), token };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);

  // Store session
  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { user: toUserResponse(user), token };
}

export async function logout(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function getMe(userId: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  return toUserResponse(user);
}
