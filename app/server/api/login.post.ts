// app/server/api/login.post.ts
import type { User } from '~/types/user';
import { z } from 'zod';

// Teraz máme zoznam používateľov
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ján Vzorový',
    email: 'user@example.com',
    avatar: 'https://i.pravatar.cc/150?u=user@example.com',
    role: 'user', // Bežný používateľ
  },
  {
    id: '2',
    name: 'Alena Adminová',
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/150?u=admin@example.com',
    role: 'admin', // Administrátor
  }
];

// Definujeme schému pre validáciu tela požiadavky pomocou Zod
const LoginSchema = z.object({
  email: z.string().email({ message: 'Neplatný formát emailu.' }),
  password: z.string().min(1, { message: 'Heslo je povinné.' }),
});

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event);
  const validation = LoginSchema.safeParse(rawBody);

  // Ak validácia zlyhá, vrátime chybu 400 s detailmi
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chybné vstupné dáta.',
      data: validation.error.flatten().fieldErrors
    });
  }

  const { email, password } = validation.data;
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Nájdi používateľa podľa emailu a hesla
  const foundUser = MOCK_USERS.find(user => user.email === email && password === 'password');

  if (foundUser) {
    return foundUser; // Vrátime nájdeného používateľa
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nesprávne meno alebo heslo.'
    });
  }
});