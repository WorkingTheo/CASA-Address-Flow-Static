import { field, validators as r } from '@dwp/govuk-casa';

export default [
  field('surname').validators([
    r.required.make({
      errorMsg: 'Surname is required',
    }),
  ]),
]
