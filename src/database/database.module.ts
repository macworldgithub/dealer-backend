import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const mongoLogger = new Logger('Mongoose');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    //@ts-ignore
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_URL, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () =>
          mongoLogger.log('Mongo Succesfully connected'),
        );
        //   connection.on('open', () => mongoLogger.log('open'));
        connection.on('disconnected', () =>
          mongoLogger.warn('Mongo Succesfully Disconnected'),
        );
        connection.on('reconnected', () =>
          mongoLogger.log('Mongo Succesfully Reconnected'),
        );
        connection.on('disconnecting', () => mongoLogger.log('disconnecting'));

        return connection;
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
