import { randomUUID } from "crypto";
import cache from "memory-cache";


export async function POST(request) {
  const authKey = 'super-secret-key';
  const authHeader = request.headers.get("knowit-umbraco-instantblock-preview-secret");

  if (authHeader !== authKey) {
    return Response.error();
  }
  const key = randomUUID();
  const json = await request.json();
  console.log(key);

  cache.put(key, json, 500);
  console.log(key);
  return Response.json(key);
}
