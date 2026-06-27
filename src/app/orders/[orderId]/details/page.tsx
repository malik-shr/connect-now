import GridDataForm, {
  filterSections,
  type UiSection,
} from "~/app/_components/GridDataForm";
import uiSchemaData from "./ui_schema_pv.json";

export default async function Details({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const sections = filterSections(uiSchemaData as UiSection[], "all");

  return <GridDataForm orderId={orderId} audience="all" sections={sections} />;
}
