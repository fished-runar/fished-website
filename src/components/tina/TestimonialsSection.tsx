import { useState } from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';
import type { TestimonialConnectionQuery, TestimonialConnectionQueryVariables } from '../../../tina/__generated__/types';

interface ModalState {
  logo: string;
  logoAlt: string;
  photo?: string;
  photoAlt?: string;
  quote: string;
  authors: Array<{ name?: string | null; title?: string | null }>;
}

interface Props {
  data: TestimonialConnectionQuery;
  query: string;
  variables: TestimonialConnectionQueryVariables;
}

export default function TestimonialsSection({ data, query, variables }: Props) {
  const { data: live } = useTina<TestimonialConnectionQuery>({ query, variables, data });
  const [modal, setModal] = useState<ModalState | null>(null);

  const testimonials = (live.testimonialConnection.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean)
    .sort((a, b) => (a!.order ?? 99) - (b!.order ?? 99));

  function openModal(t: (typeof testimonials)[0]) {
    if (!t) return;
    setModal({
      logo: t.logo ?? '',
      logoAlt: t.company,
      photo: t.photo ?? undefined,
      photoAlt: t.photo ? t.company : undefined,
      quote: `\u201c${t.quote}\u201d`,
      authors: t.authors?.filter(Boolean) ?? [],
    });
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setModal(null);
    document.body.style.overflow = '';
  }

  return (
    <>
      <div className="testimonials-track three-col">
        {testimonials.map((t) => {
          const firstAuthor = t!.authors?.[0] ?? {};
          return (
            <div key={t!.id} className="testimonial-card reveal">
              <img
                className="testimonial-logo"
                src={t!.logo ?? ''}
                alt={t!.company}
                data-tina-field={tinaField(t!, 'logo')}
              />
              <p
                className="testimonial-quote"
                data-tina-field={tinaField(t!, 'previewQuote')}
              >
                &ldquo;{t!.previewQuote}&rdquo;
              </p>
              <button className="btn-read-more" onClick={() => openModal(t)}>
                Read more &rarr;
              </button>
              <div className="testimonial-author">
                <div>
                  <strong data-tina-field={tinaField(firstAuthor, 'name')}>
                    {firstAuthor.name}
                  </strong>
                  <span data-tina-field={tinaField(firstAuthor, 'title')}>
                    {firstAuthor.title}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div
          className="t-modal-overlay open"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="t-modal">
            <button className="t-modal-close" aria-label="Close" onClick={closeModal}>
              &times;
            </button>
            <img className="t-modal-logo" src={modal.logo} alt={modal.logoAlt} />
            {modal.photo && (
              <img className="t-modal-photo" src={modal.photo} alt={modal.photoAlt} />
            )}
            <p className="t-modal-quote">{modal.quote}</p>
            <div className="t-modal-authors">
              {modal.authors.map((a, i) => (
                <div key={i} className="t-modal-author">
                  <strong>{a.name}</strong>
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
