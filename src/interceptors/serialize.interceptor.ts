import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassConstructor, plainToClass } from 'class-transformer';

// decorator
export function Serilize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {

    return next.handle().pipe(
      map((data: T) => {

        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}