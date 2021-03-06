import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'AlphaAvantage',
  connector: 'rest',
  baseURL: 'https://www.alphavantage.co/',
  crud: false,
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={keywords}&apikey={apiKey}',
        fullResponse: true
      },
      functions: {
        symbolSearch: ['apiKey', 'keywords']
      },
    },
    {
      template: {
        method: 'GET',
        url: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=5min&outputsize=full&symbol={symbol}&apikey={apiKey}',
        fullResponse: true
      },
      functions: {
        timeSeries: ['apiKey', 'symbol']
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AlphaAvantageDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'AlphaAvantage';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.AlphaAvantage', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
