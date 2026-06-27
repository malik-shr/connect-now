import GridDataForm, {
  filterSections,
  type UiSection,
} from "~/app/_components/GridDataForm";
import uiSchemaData from "../ui_schema_pv.json";

export default async function InstallerDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const sections = filterSections(uiSchemaData as UiSection[], "installer");

  return (
    <GridDataForm orderId={orderId} audience="installer" sections={sections} />
  );
}
