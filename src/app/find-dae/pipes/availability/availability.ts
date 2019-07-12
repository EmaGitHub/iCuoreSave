import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the AvailabilityPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'availabilityPipe',
})
export class AvailabilityPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string) {


    return value.replace(/\\n/g, '<br/>')
  }
}
