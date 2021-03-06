import {injectable, inject, BindingScope} from '@loopback/core';
import moment from 'moment-timezone';
import { AlphaAvantageClient, Symbol as AlphaSymbol } from './alpha-avantage-client.service';
import { Symbol, TimeSlice } from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class AlphaAvantage {
  
  @inject('services.AlphaAvantageClient')
  private alphaAvantageClient: AlphaAvantageClient;
  
  private INTERVAL_MINUTES: number = 5;
  
  async findMatchingSymbols (searchString: string): Promise<Symbol[]> {
    // search alpha api for symbol
    const searchResult = await this.alphaAvantageClient.symbolSearch(searchString);
    // loop results, convert to Symbols
    const matchingSymbols: Symbol[] = searchResult.bestMatches.map((matchedSymbol: AlphaSymbol) => {
      return new Symbol({
        symbol: matchedSymbol["1. symbol"],
        name: matchedSymbol["2. name"],
        type: matchedSymbol["3. type"],
        region: matchedSymbol["4. region"],
        marketOpen: matchedSymbol["5. marketOpen"],
        marketClose: matchedSymbol["6. marketClose"],
        timezone: matchedSymbol["7. timezone"],
        currency: matchedSymbol["8. currency"],
        matchScore: parseFloat(matchedSymbol["9. matchScore"])
      });
    });
    // return list of matching symbols
    return matchingSymbols;
  }
  
  async fetchTimeSeries (symbol: string, start: moment.Moment, end: moment.Moment): Promise<TimeSlice[]> {
    const KEY_FORMAT = "YYYYMMDDHHmmss";
    // check if same day
    const sliceDuration = (start.format("YYYYMMDD") == end.format("YYYYMMDD")) ? "hour" : "day";
    // set our start and end times
    start.seconds(0);
    end.seconds(59);
    start.minutes(0);
    end.minutes(59);
    start.hours(0);
    end.hours(23);
    // fetch time series from alpha api
    const timeSeriesResult = await this.alphaAvantageClient.timeSeries(symbol);
    const timeSeriesMap = timeSeriesResult[`Time Series (${this.INTERVAL_MINUTES}min)`];
    const timezoneId = timeSeriesResult["Meta Data"]["6. Time Zone"];
    // build collection of time slives
    const timeSlices: {[timestamp: string]: TimeSlice} = {};
    // loop results
    for (let timestamp in timeSeriesMap) {
      // attempt to parse timestamp
      let parsedTime = moment.tz(timestamp, "YYYY-MM-DD HH:mm:ss", timezoneId).utc(),
          parsedMs = parsedTime.valueOf();
      // if this is NOT in our search range (inclusive search: [])
      if (!parsedTime.isBetween(start, end, undefined, "[]")) {
        // then skip this item, not in our search
        continue;
      } // else, we need to include this item
      let timeSlice = timeSeriesMap[timestamp],
        open = parseFloat(timeSlice["1. open"]),
        high = parseFloat(timeSlice["2. high"]),
        low = parseFloat(timeSlice["3. low"]),
        close = parseFloat(timeSlice["4. close"]),
        volume = parseInt(timeSlice["5. volume"]);
      // get start key used for storing slices
      let startKeyTime = parsedTime.clone();
      // zero out minutes and seconds
      startKeyTime.seconds(0);
      startKeyTime.minutes(0);
      // if we are slicing by day
      if (sliceDuration == "day") {
        //then zero out hour too
        startKeyTime.hours(0);
      }
      // our start key
      let sliceStartKey = startKeyTime.format(KEY_FORMAT);
      // if this is the first slice in our slice range
      if (!(sliceStartKey in timeSlices)) {
        // then we need to initiate a new time slice for this range
        timeSlices[sliceStartKey] = new TimeSlice({
          timestamp: startKeyTime.toISOString(),
          duration: 1000 * 60 * 60 * (sliceDuration == "day" ? 24 : 1),
          totalVolume: 0,
          earliestDataTime: parsedMs,
          latestDataTime: parsedMs,
          open,
          close,
          high: -Infinity,
          low: Infinity
        });
      }
      // incorporate our current parsed slice into our new existing stored slice
      let slice = timeSlices[sliceStartKey],
        sliceKey = parsedTime.format(KEY_FORMAT);
      // add to volume
      slice.totalVolume! += volume;
      // if our slice is at the beginning of our interval
      if (parsedMs < slice.earliestDataTime) {
        slice.earliestDataTime = parsedMs;
        slice.open = open;
      }
      // if our slice is at the end of our interval
      if (parsedMs > slice.latestDataTime) {
        slice.latestDataTime = parsedMs;
        slice.close = close;
      }
      // update high and low
      slice.high = Math.max(slice.high!, high);
      slice.low = Math.min(slice.low!, low);
    }
    // return slices ordered by time
    return Object.values(timeSlices).sort((a, b) => {
      return moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf();
    });
  }
  
}
