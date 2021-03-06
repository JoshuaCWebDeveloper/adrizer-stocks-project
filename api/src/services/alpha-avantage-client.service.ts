import {inject} from '@loopback/core';
import {serviceProxy} from '@loopback/service-proxy';
import { HttpErrors } from '@loopback/rest';
import { HttpClient, LoopbackResponse } from "../lib/HttpClient";
import {AlphaAvantageDataSource} from '../datasources';

export type NoteResult = {
  "Note": string;
}

export interface Symbol {
  "1. symbol": string;
  "2. name": string;
  "3. type": string;
  "4. region": string;
  "5. marketOpen": string;
  "6. marketClose": string;
  "7. timezone": string;
  "8. currency": string;
  "9. matchScore": string;
}

export interface SymbolSearchResult {
  bestMatches: Symbol[];
}

export interface TimeSlice {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. volume": string;
}

export interface TimeSeries {
  [timestamp: string]: TimeSlice;
}

export type TimeSeriesResult = {
  "Meta Data": { [key: string]: string };
} & {
  [seriesName: string]: TimeSeries;
}


export interface AlphaAvantageProxy {
   
  symbolSearch(apiKey: string, keywords: string): Promise<LoopbackResponse>;
  
  timeSeries(apiKey: string, symbol: string): Promise<LoopbackResponse>;
    
}

export class AlphaAvantageClient extends HttpClient {
  
  @inject('config.ALPHA_API_KEY')
  private alphaApiKey: string;
  
  @serviceProxy("AlphaAvantage")
  private alphaProxy: AlphaAvantageProxy
  
  private async fetchAlphaResult<T> (callable: Function): Promise<T> {
      // make request, get response
      const response: LoopbackResponse = await this.fetchClientResponse(callable);
      const note: NoteResult = response.body;
      // if this is a note
      if (typeof note.Note != "undefined") {
        // this is likely rate limiting
        // throw error
        throw new HttpErrors.TooManyRequests(note.Note);
      }
      // get body
      const body: T = response.body;
      return body;
  }
  
  async symbolSearch(keywords: string): Promise<SymbolSearchResult> {
    return this.fetchAlphaResult<SymbolSearchResult>(
      () => this.alphaProxy.symbolSearch(this.alphaApiKey, keywords)
    );
    
  }
  
  async timeSeries(symbol: string): Promise<TimeSeriesResult> {
    return this.fetchAlphaResult<TimeSeriesResult>(
      () => this.alphaProxy.timeSeries(this.alphaApiKey, symbol)
    );
  }
}
