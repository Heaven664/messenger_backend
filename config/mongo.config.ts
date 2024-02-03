import 'dotenv/config';

export const MongoConnectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.237ozrg.mongodb.net/main/?retryWrites=true&w=majority`;
