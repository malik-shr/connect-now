import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div>
      <Link href={`/orders/${slug}/details`}>Details</Link>;
      <Link href={`/orders/${slug}/details`}>Status</Link>;
      <Link href={`/orders/${slug}/details`}>Request Help</Link>;
    </div>
  );
}
