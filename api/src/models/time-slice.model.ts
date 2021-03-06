import {Model, model, property} from '@loopback/repository';

@model()
export class TimeSlice extends Model {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  timestamp: string;

  @property({
    type: 'number',
    required: true,
  })
  duration: number;
  
  @property({
    type: 'number',
    required: true
  })
  earliestDataTime: number;
  
  @property({
    type: 'number',
    required: true
  })
  latestDataTime: number;

  @property({
    type: 'number',
    required: true,
  })
  open?: number;

  @property({
    type: 'number',
    required: true,
  })
  close?: number;

  @property({
    type: 'number',
    required: true,
  })
  high?: number;

  @property({
    type: 'number',
    required: true,
  })
  low?: number;

  @property({
    type: 'number',
    required: true,
  })
  totalVolume?: number;


  constructor(data?: Partial<TimeSlice>) {
    super(data);
  }
}

export interface TimeSliceRelations {
  // describe navigational properties here
}

export type TimeSliceWithRelations = TimeSlice & TimeSliceRelations;
