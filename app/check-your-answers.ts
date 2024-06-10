import { JourneyContext, waypointUrl } from "@dwp/govuk-casa";
import { Request, Response } from "express";
import { removeWaypointsFromJourneyContext } from './app';

export function patientDetailsSection(journeyContext: JourneyContext, res: Response) {
  const nameData = journeyContext.getDataForPage('name') as { name: string };
  const nameRow = {
    key: {
      text: 'Patient Name'
    },
    value: {
      text: nameData.name,
    },
    actions: {
      items: [
        {
          text: "Change your answer",
          href: waypointUrl({ waypoint: 'name', edit: true, editOrigin: 'check-your-answers' })
        }
      ]
    }
  };

  const surnameData = journeyContext.getDataForPage('surname') as { surname: string };
  const surnameRow = {
    key: {
      text: 'Patient Surname'
    },
    value: {
      text: surnameData.surname,
    },
    actions: {
      items: [
        {
          text: "Change your answer",
          href: waypointUrl({ waypoint: 'surname', edit: true, editOrigin: 'check-your-answers' })
        }
      ]
    }
  };

  const addressData = journeyContext.getDataForPage('address-confirmation') as { address: string };
  const addressRow = {
    key: {
      text: 'Address'
    },
    value: {
      text: addressData.address,
    },
    actions: {
      items: [
        {
          text: "Change your answer",
          href: "/edit-address"
        }
      ]
    }
  };

  res.locals.patientDetailsRows = [
    nameRow,
    surnameRow,
    addressRow
  ];
}
export function checkYourAnswers(req: Request, res: Response) {
  const journeyContext = JourneyContext.getDefaultContext(req.session);

  journeyContext.setDataForPage('edit', { edit: false });
  removeWaypointsFromJourneyContext(req, ['skippedTo', 'skippedFrom']);
  patientDetailsSection(journeyContext, res);

  JourneyContext.putContext(req.session, (req as any).casa.journeyContext);
  req.session.save();
}
