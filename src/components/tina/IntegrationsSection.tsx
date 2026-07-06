import { useTina, tinaField } from 'tinacms/dist/react';
import type { IntegrationConnectionQuery, IntegrationConnectionQueryVariables } from '../../../tina/__generated__/types';

interface Props {
  data: IntegrationConnectionQuery;
  query: string;
  variables: IntegrationConnectionQueryVariables;
}

export default function IntegrationsSection({ data, query, variables }: Props) {
  const { data: live } = useTina<IntegrationConnectionQuery>({ query, variables, data });

  const integrations = (live.integrationConnection.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean)
    .sort((a, b) => (a!.order ?? 99) - (b!.order ?? 99));

  return (
    <div className="customer-logos-grid reveal visible">
      {integrations.map((i) => (
        <img
          key={i!.id}
          src={i!.logo ?? ''}
          alt={i!.name}
          loading="lazy"
          data-tina-field={tinaField(i!, 'logo')}
        />
      ))}
    </div>
  );
}
