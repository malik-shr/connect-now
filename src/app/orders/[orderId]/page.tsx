import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-xl font-bold">Vorgang: {orderId}</h1>
      <div className="flex flex-col space-y-2">
        <Link
          href={`/orders/${orderId}/details`}
          className="text-blue-600 underline"
        >
          → Details (Dynamic JSON Form)
        </Link>
        <Link
          href={`/orders/${orderId}/details`}
          className="pointer-events-none text-slate-400"
        >
          Status Check
        </Link>
        <Link
          href={`/orders/${orderId}/details`}
          className="pointer-events-none text-slate-400"
        >
          Request Help
        </Link>
      </div>
    </div>
  );
}
