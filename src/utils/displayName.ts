import type { User } from "../types";

// What we show as the name of a user: the nickname, or the email for old accounts without one.
export function displayName(user: Pick<User, "username" | "email">): string {
  return user.username?.trim() || user.email;
}

// First letter for the round avatar.
export function avatarLetter(user: Pick<User, "username" | "email">): string {
  return displayName(user).charAt(0).toUpperCase();
}