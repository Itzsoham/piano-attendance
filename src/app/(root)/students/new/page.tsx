import { StudentForm } from "../_components/student-form";

export default function NewStudentPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
        <p className="text-muted-foreground">Create a new student profile</p>
      </div>
      <StudentForm />
    </div>
  );
}
