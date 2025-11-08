import { varchar } from 'drizzle-orm/mysql-core';
import {pgTable, uuid} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  firstname: varchar('first_name')
});
