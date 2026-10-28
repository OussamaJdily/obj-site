import { notFound } from 'next/navigation';

// Any deeper unknown URL (e.g. /fr/a/b) renders the localized 404 page.
export default function CatchAll() {
  notFound();
}
