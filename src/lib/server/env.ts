import { env } from '$env/dynamic/private';

export function getPrivateEnv() {
	return env;
}
