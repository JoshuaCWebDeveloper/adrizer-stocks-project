import {Model, model, property} from '@loopback/repository';

@model()
export class Symbol extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  symbol: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  region: string;

  @property({
    type: 'string',
    required: true,
  })
  marketOpen: string;

  @property({
    type: 'string',
    required: true,
  })
  marketClose: string;

  @property({
    type: 'string',
    required: true,
  })
  timezone: string;

  @property({
    type: 'string',
    required: true,
  })
  currency: string;

  @property({
    type: 'number',
    required: true,
  })
  matchScore: number;


  constructor(data?: Partial<Symbol>) {
    super(data);
  }
}

export interface SymbolRelations {
  // describe navigational properties here
}

export type SymbolWithRelations = Symbol & SymbolRelations;
