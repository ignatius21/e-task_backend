import mongoose from 'mongoose';
import colors from 'colors';
import { exit } from 'node:process';

export const connectDB = async () => {
    try {
       const connection = await mongoose.connect(process.env.DATABASE_URL)
       const url = `${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`
         console.log(colors.bgCyan.bold(`Conectado a la base de datos ${url}`))
    } catch (error) {
        console.log(error.message.red);
        exit(1);
    }
};