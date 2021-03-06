/* HttpClient.ts
 * Base class to construct loopback http client
 * Dependencies: modules, services, classes
 * Author: Joshua Carter
 * Created: March 5, 2021
 */
"use strict";
//import dependencies
import http from 'http';
import { HttpErrors } from '@loopback/rest';

export type LoopbackResponse = http.IncomingMessage & {
  body: any
}

export abstract class HttpClient {
  
  protected async fetchClientResponse (callable: Function): Promise<LoopbackResponse> {
      // make request, get response
      const response: LoopbackResponse = await callable();
      if (typeof response.statusCode != "undefined" && response.statusCode! >= 400) {
        // throw error
        throw new (HttpErrors as any)(
            response.statusCode!,
            response.statusMessage!,
            {response}
        );
      }
      return response;
  }

  protected async fetchClientResult<T> (callable: Function): Promise<T> {
      // make request, get response
      const response: LoopbackResponse = await this.fetchClientResponse(callable);
      // return non-response object
      if (typeof response.statusCode == "undefined") {
        return <T><unknown>response;
      }
      // parse the body into the correct type
      const body: T = response.body;
      return body;
  }
}
