import { password } from "bun";
import { db } from "../db/client";
import type { RegisterRequest } from "../types/http";
import type { UserRow } from "../types/db";

export async function insertOne(input: RegisterRequest) {
  const createdAt = new Date().toISOString();

  const [created] = await db<
    UserRow[]
  >`INSERT INTO users (username, visibility, profile_image, bio, display_name, email, phone, birthdate, password, created_at) VALUES (${input.username}, ${input.visibility}, ${input.profile_image}, ${input.bio}, ${input.display_name}, ${input.email}, ${input.phone}, ${input.birthdate}, ${input.password}, ${createdAt}) RETURNING *`;

  if (!created) throw new Error("Failed to create user!");

  return created;
}

export async function getByUsername(username: string) {
  const [user] = await db<UserRow[]>`
    SELECT * FROM users where username = ${username}
    `;

  return user || null;
}
export async function followUser(request: FastifyRequest<{ params: { username: string } }>, reply: FastifyReply) {
  const followerUsername = request.tokenPayload.username;
  const followeeUsername = request.params.username;

  if (followerUsername === followeeUsername) {
    return reply.status(400).send({ error: "You cannot follow yourself."});

  }

  await userRepository.follow(followerUsername, followeeUsername);

  return { message: `You are now following ${followeeUsername}.` };
 }

 export async function unfollowUser(request: FastifyRequest<{ params: { username: string } }>, reply: FastifyReply) {
  const followerUsername = request.tokenPayload.username;
  const followeeUsername = request.params.username;

  await userRepository.unfollow(followerUsername, followeeUsername);

  return { message: `You have unfollowed ${followeeUsername}.` };
 }

 export async function getFeed(request: FastifyRequest, reply: FastifyReply) {
  const username = request.tokenPayload.username;
  const feed = await userRepository.getFeed(username);
  return { feed };
 }