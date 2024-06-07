import path from 'path';
import helmet from 'helmet';
import { Store } from 'express-session';
import { JourneyContext, configure } from "@dwp/govuk-casa";
import express, { Request, Response } from 'express';
import { pages } from './pages';
import { plan } from './plan';
import axios from 'axios';

export const FOUND_ADDRESSES_DATA = 'found-addresses-data';

function getDataForPage(req: Request, waypoint: string) {
  return (req as any).casa.journeyContext.getDataForPage(waypoint);
}

function setDataForPage(req: Request, waypoint: string, data: any) {
  (req as any).casa.journeyContext.setDataForPage(waypoint, data);
}

export const removeWaypointsFromJourneyContext = (req: Request, waypoints: string[], includeTempData?: boolean) => {
  const allData = (req as any).casa.journeyContext.getData();
  const allWaypoints = Object.keys(allData);
  const removedData = allWaypoints.reduce((acc, waypoint) => {
    const removeTempWaypoint = waypoints.includes(waypoint.replace('temp-', '')) && includeTempData;
    if (waypoints.includes(waypoint) || removeTempWaypoint) {
      return acc;
    }
    return { ...acc, [waypoint]: allData[waypoint] };
  }, {});
  (req as any).casa.journeyContext.setData(removedData);
};

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
    const addressConfirmationData = getDataForPage(req, 'address-confirmation') as { address: string };
    if(addressConfirmationData?.address !== undefined) {
      res.redirect('/address-confirmation');
      return;
    }
    res.redirect('/post-code');
  });

  ancillaryRouter.use('/search-again', (req: Request, res: Response) => {
    const waypointsToRemove = ['post-code', 'post-code-results', 'address-manual'];
  
    removeWaypointsFromJourneyContext(req, waypointsToRemove);
    JourneyContext.putContext(req.session, (req as any).casa.journeyContext);
    req.session.save(() => res.redirect('/post-code'));
  });

  ancillaryRouter.use('/post-code', async (req: Request, res: Response) => {
    if (req.method === 'GET') {
      res.locals.formData = getDataForPage(req, 'post-code');
      res.render('pages/post-code.njk');
    }

    if (req.method === 'POST') {
      //handle data consumption;
      console.log({ body: req.body });
      const data = req.body;
      const results = await axios.post<string[]>('http://localhost:3001/address', data);
      const addresses = results.data;
      setDataForPage(req, FOUND_ADDRESSES_DATA, { addresses });
      setDataForPage(req, 'post-code', { postcode: req.body.postcode });
      res.redirect('/post-code-results');
    }
  });

  ancillaryRouter.use('/post-code-results', (req: Request, res: Response) => {
    if (req.method === 'GET') {
      const { addresses } = getDataForPage(req, FOUND_ADDRESSES_DATA) as { addresses: string[] };
      const addressOptions = addresses.map(address => ({ value: address, text: address }));
      res.locals.addressOptions = addressOptions;
      res.locals.formData = getDataForPage(req, 'post-code-results');
      res.render('pages/post-code-results.njk');
    }

    if(req.method === 'POST') {
      setDataForPage(req, 'post-code-results', { address: req.body.address });
      setDataForPage(req, 'address-confirmation', { address: req.body.address });
      res.redirect('/address-confirmation');
    }
  });

  ancillaryRouter.use('/address-confirmation', (req: Request, res: Response) => {
    if (req.method === 'GET') {
      res.locals.formData = getDataForPage(req, 'address-confirmation');
      res.render('pages/address-confirmation');
    }

    if (req.method === 'POST') {
      setDataForPage(req, 'address-confiramtion', { address: req.body.address });
      res.redirect('/start');
    }
  });

  ancillaryRouter.use('/address-manual', (req: Request, res: Response) => {
    if (req.method === 'GET') {
      res.render('pages/address-manual.njk');
    }

    if (req.method === 'POST') {
      const { addressLine1, addressLine2, town, county, postCode } = req.body; 
      setDataForPage(req, 'address-confirmation', { address: `${addressLine1} - ${postCode}`});
      res.redirect('/address-confirmation');
    }
  })

  return mount(casaApp, {});
}

export default app;
