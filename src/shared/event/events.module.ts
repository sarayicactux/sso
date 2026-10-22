import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 50,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [],
  exports: [EventEmitterModule],
})
export class EventsModule {}
