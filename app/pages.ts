import { NextFunction, Request, Response } from 'express';

import nameFields from './definitions/name';
import surnameFields from './definitions/surname';

export const pages = [
  {
    waypoint: 'name',
    view: 'pages/name.njk',
    fields: nameFields
  },
  {
    waypoint: 'surname',
    view: 'pages/surname.njk',
    fields: surnameFields,
  }
];
