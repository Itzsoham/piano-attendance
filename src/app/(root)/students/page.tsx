import { getStudents } from "@/lib/actions/students";
import { columns } from "./_components/columns";
import { StudentTable } from "./_components/student-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage your students and track their progress</p>
        </div>
        <Button asChild>
          <Link href="/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <StudentTable columns={columns} data={students} />
    </div>
  );
}
