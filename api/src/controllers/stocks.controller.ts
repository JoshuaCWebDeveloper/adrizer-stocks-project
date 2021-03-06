import {inject} from '@loopback/core';
import {api, get, param, HttpErrors} from '@loopback/rest';
import moment from 'moment';
import { AlphaAvantage } from '../services';
import { Symbol, TimeSlice } from '../models';

@api({basePath: "/stocks"})
export class StocksController {
  @inject("services.AlphaAvantage")
  private alphaService: AlphaAvantage;
  
  constructor() {
    
  }
  
  @get("/search")
  async search(@param.query.string("searchString") searchString = ""): Promise<Symbol[]> {
    if (!searchString) {
      throw new HttpErrors.BadRequest("`searchString` parameter is required");
    }
    
    return this.alphaService.findMatchingSymbols(searchString);
  }
  
  @get("/timeSeries")
  async timeSeries(
    @param.query.string("symbol") symbol = "",
    @param.query.string("start") start = "",
    @param.query.string("end") end = ""
  ): Promise<TimeSlice[]> {
    if (!symbol) {
      throw new HttpErrors.BadRequest("`symbol` parameter is required");
    }
    const parsedStart = moment.parseZone(start),
      parsedEnd = moment.parseZone(end);
    if (!parsedStart.isValid() || !parsedEnd.isValid()) {
      throw new HttpErrors.BadRequest(
        `Received invalid \`start\` (${start}) or \`end\` (${end})`
      );
    }
    return this.alphaService.fetchTimeSeries(symbol, parsedStart, parsedEnd);  
  }
}
