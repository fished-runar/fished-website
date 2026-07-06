import { useTina, tinaField } from 'tinacms/dist/react';
import type { TeamConnectionQuery, TeamConnectionQueryVariables } from '../../../tina/__generated__/types';

interface Props {
  data: TeamConnectionQuery;
  query: string;
  variables: TeamConnectionQueryVariables;
}

export default function TeamSection({ data, query, variables }: Props) {
  const { data: live } = useTina<TeamConnectionQuery>({ query, variables, data });

  const team = (live.teamConnection.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean)
    .sort((a, b) => (a!.order ?? 99) - (b!.order ?? 99));

  function formatPhone(raw: string) {
    return raw.replace('tel:', '').replace(/^\+47(\d{2})(\d{3})(\d{2})(\d{2})$/, '+47 $1 $2 $3 $4');
  }

  return (
    <div className="team-grid">
      {team.map((m) => (
        <div key={m!.id} className="team-card reveal visible">
          <img
            className="team-card-photo"
            src={m!.photo ?? ''}
            alt={m!.name}
            loading="lazy"
            data-tina-field={tinaField(m!, 'photo')}
          />
          <div className="team-card-body">
            <p className="team-card-name" data-tina-field={tinaField(m!, 'name')}>
              {m!.name}
            </p>
            <p className="team-card-role" data-tina-field={tinaField(m!, 'role')}>
              {m!.role}
            </p>
            <div className="team-card-contacts">
              {m!.phone && (
                <a href={m!.phone} data-tina-field={tinaField(m!, 'phone')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {formatPhone(m!.phone)}
                </a>
              )}
              {m!.email && (
                <a href={`mailto:${m!.email}`} data-tina-field={tinaField(m!, 'email')}>
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {m!.email}
                </a>
              )}
            </div>
            {m!.linkedin && (
              <div className="team-card-linkedin">
                <a href={m!.linkedin} target="_blank" rel="noopener" data-tina-field={tinaField(m!, 'linkedin')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
