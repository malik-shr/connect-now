import { redirect } from "next/navigation";

async function createProject(formData) {
  "use server";

  const projectName = formData.get("project_name");
  redirect(`/orders/${projectName}`);
}

export default function Register() {
  return (
    <form action={createProject}>
      <input name="project_name" placeholder="Projektname" />

      <button type="submit">New Project</button>
    </form>
  );
}
