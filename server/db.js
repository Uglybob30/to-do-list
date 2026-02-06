import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    user: 'postgres',
    host: 'neondb',
    database: 'to_do_list',
    password: 'Jerico30',
    port: 5432
});
