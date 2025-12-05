import { getStudentById } from "@/lib/actions/students";
import { StudentForm } from "../../_components/student-form";
import { notFound } from "next/navigation";

interface EditStudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;

  try {
    const student = await getStudentById(id);

    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
          <p className="text-muted-foreground">Update student information</p>
        </div>
        <StudentForm initialData={student} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
