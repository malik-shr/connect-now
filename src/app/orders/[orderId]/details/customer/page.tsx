import CustomerWizard from "~/app/_components/CustomerWizard";

export default async function CustomerDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <CustomerWizard orderId={orderId} />;
}
