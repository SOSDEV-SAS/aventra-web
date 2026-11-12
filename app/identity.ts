import {headers} from 'next/headers';
import {env} from 'cloudflare:workers';

/** Editing is denied without identity verified by a trusted gateway. */
export async function getAventraUser() {
  const request = await headers();
  const secret = env.IDENTITY_SHARED_SECRET;
  const supplied = request.get('x-aventra-identity-secret');
  if (!secret || !supplied) return null;
  const hash = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [expected, received] = await Promise.all([hash(secret),hash(supplied)]);
  let difference = 0;
  for (let index=0;index<expected.length;index++) difference |= expected[index]^received[index];
  if (difference) return null;
  const userId = request.get('x-aventra-user-id');
  const email = request.get('x-aventra-user-email');
  if (!userId || userId.length>200 || !email || email.length>254) return null;
  return {userId,email};
}
