import path from 'path';
import helmet from 'helmet';
import { Store } from 'express-session';
import { configure } from "@dwp/govuk-casa";
import express, { Request, Response } from 'express';
import { pages } from './pages';
import { plan } from './plan';
import axios from 'axios';

export const FOUND_ADDRESSES_DATA = 'found-addresses-data';

const app = (
  name: string,
  secret: string,
  ttl: number,
  secure: boolean,
  sessionStore: Store,
) => {
  const casaApp = express();
  casaApp.use(helmet.noSniff());

  const viewDir = path.join(__dirname, './views/');
  const localesDir = path.join(__dirname, './locales/');

  const { mount, ancillaryRouter } = configure({
    views: [viewDir],
    i18n: {
      dirs: [localesDir],
      locales: ['en'],
    },
    session: {
      name,
      secret,
      ttl,
      secure,
      store: sessionStore,
    },
    pages,
    plan
  });

  ancillaryRouter.use('/start', (req: Request, res: Response) => {
    res.render('pages/start.njk');
  });

  ancillaryRouter.use('/address-route', (req: Request, res: Response) => {
    res.redirect('/post-code');
  });

  ancillaryRouter.use('/post-code', async (req: Request, res: Response) => {
    if (req.method === 'GET') {
      res.locals.formData = (req as any).casa.journeyContext.getDataForPage('post-code');
      res.render('pages/post-code.njk');
    }

    if (req.method === 'POST') {
      //handle data consumption;
      console.log({ body: req.body });
      const data = req.body;
      const results = await axios.post<string[]>('http://localhost:3001/address', data);
      const addresses = results.data;
      (req as any).casa.journeyContext.setDataForPage(FOUND_ADDRESSES_DATA, { addresses });
      (req as any).casa.journeyContext.setDataForPage('post-code', { postcode: req.body.postcode });
      res.redirect('/post-code-results');
    }
  });

  ancillaryRouter.use('/post-code-results', (req: Request, res: Response) => {
    if (req.method === 'GET') {
      const { addresses } = (req as any).casa.journeyContext.getDataForPage(FOUND_ADDRESSES_DATA) as { addresses: string[] };
      const addressOptions = addresses.map(address => ({ value: address, text: address }));
      res.locals.addressOptions = addressOptions;
      res.locals.formData = (req as any).casa.journeyContext.getDataForPage('post-code-results');
      res.render('pages/post-code-results.njk');
    }

    if(req.method === 'POST') {
      (req as any).casa.journeyContext.setDataForPage('post-code-results', { address: req.body.address });
      res.redirect('/start');
    }
  })

  return mount(casaApp, {});
}

export default app;
