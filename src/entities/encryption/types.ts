export type encryptor = {
	encrypt: (input: string) => string;
	compare: (input1: string, input2: string) => boolean;
};
