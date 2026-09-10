import { validateEnv } from "./env.schema";

export default function configuration() {
  return validateEnv(process.env);
}
