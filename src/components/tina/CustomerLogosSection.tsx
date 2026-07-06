import { useTina, tinaField } from 'tinacms/dist/react';
import type { CustomerConnectionQuery, CustomerConnectionQueryVariables } from '../../../tina/__generated__/types';

interface Props {
  data: CustomerConnectionQuery;
  query: string;
  variables: CustomerConnectionQueryVariables;
}

export default function CustomerLogosSection({ data, query, variables }: Props) {
  const { data: live } = useTina<CustomerConnectionQuery>({ query, variables, data });

  const customers = (live.customerConnection.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean)
    .sort((a, b) => (a!.order ?? 99) - (b!.order ?? 99));

  return (
    <div className="customer-logos-grid reveal visible">
      {customers.map((c) => (
        <img
          key={c!.id}
          src={c!.logo ?? ''}
          alt={c!.name}
          loading="lazy"
          data-tina-field={tinaField(c!, 'logo')}
        />
      ))}
    </div>
  );
}
