import { useTina, tinaField } from 'tinacms/dist/react';
import type { OfficeConnectionQuery, OfficeConnectionQueryVariables } from '../../../tina/__generated__/types';

interface Props {
  data: OfficeConnectionQuery;
  query: string;
  variables: OfficeConnectionQueryVariables;
}

export default function OfficesOverlay({ data, query, variables }: Props) {
  const { data: live } = useTina<OfficeConnectionQuery>({ query, variables, data });

  const offices = (live.officeConnection.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean)
    .sort((a, b) => (a!.order ?? 99) - (b!.order ?? 99));

  return (
    <div className="offices-list">
      {offices.map((o) => (
        <a
          key={o!.id}
          className="office-item"
          href={o!.mapsUrl ?? '#'}
          target="_blank"
          rel="noopener"
          data-tina-field={tinaField(o!, 'city')}
        >
          <div className="office-pin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <strong>{o!.city}</strong>
        </a>
      ))}
    </div>
  );
}
