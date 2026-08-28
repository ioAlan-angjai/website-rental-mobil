import { redirect } from 'next/navigation';

interface CarDetailPageProps {
  params: { id: string };
}

export default function CatalogRedirectPage({ params }: CarDetailPageProps) {
  redirect(`/armada/${params.id}`);
}
