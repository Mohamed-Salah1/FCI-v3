import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mockAttendance } from "@/utils/mockData";
import { motion } from "framer-motion";
import { Users, Plus, MoreVertical, Edit, Trash2, User, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "@/types/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentForm } from "@/components/forms/StudentForm";
import { toast } from "sonner";


interface Props { asTab?: boolean }

const StudentsPage = ({ asTab }: Props) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([
    { id: "s1", name: "Maya Johnson", grade: "Grade 10", bus: "SB-101", stop: "Al Ustad St North", status: "active", email: "student@bustrack.io", phone: "01011112222" },
    { id: "s2", name: "Ali Hassan", grade: "Grade 9", bus: "SB-102", stop: "Al Geish St - City Center", status: "active", email: "ali.h@bustrack.io", phone: "01022223333" },
    { id: "s3", name: "Emma Davis", grade: "Grade 11", bus: "SB-102", stop: "Al Geish St North", status: "active", email: "emma.d@bustrack.io", phone: "01033334444" },
    { id: "s4", name: "Noah Smith", grade: "Grade 8", bus: "SB-103", stop: "West of Al Geish St", status: "active", email: "noah.s@bustrack.io", phone: "01044445555" },
    { id: "s5", name: "Lara Khalil", grade: "Grade 10", bus: "SB-103", stop: "Gen. Gamal Hamad St", status: "active", email: "lara.k@bustrack.io", phone: "01055556666" },
    { id: "s6", name: "Zain Abou", grade: "Grade 11", bus: "SB-104", stop: "Al Mahkama St", status: "active", email: "zain.a@bustrack.io", phone: "01066667777" },
  ]);

  const handleDelete = (id: string) => { setStudents(students.filter(s => s.id !== id)); toast.success("Deleted"); };

  const columns: ColumnDef<Student>[] = [
    { accessorKey: "name", header: "Student", cell: ({ row }) => (
      <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold">{row.original.name.charAt(0)}</div><div className="flex flex-col"><span className="font-medium">{row.original.name}</span><span className="text-[10px] text-muted-foreground">{row.original.email}</span></div></div>
    )},
    { accessorKey: "grade", header: "Grade" },
    { accessorKey: "bus", header: "Bus & Stop", cell: ({ row }) => <div className="flex flex-col"><span className="text-sm font-medium">{row.original.bus}</span><span className="text-xs text-muted-foreground">{row.original.stop}</span></div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "outline"} className="capitalize text-[10px] h-5">{row.original.status}</Badge> },
    { id: "actions", header: () => <div className="text-right">Actions</div>, cell: ({ row }) => (
      <div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditingStudent(row.original)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem><User className="h-4 w-4 mr-2" /> View</DropdownMenuItem><DropdownMenuItem><History className="h-4 w-4 mr-2" /> Attendance</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    )},
  ];

  const inner = (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-primary" />Students</h2>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border border-border/50 p-4">
          <DataTable columns={columns} data={students} searchKey="name" searchPlaceholder="Search students..." />
        </motion.div>
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader><StudentForm onSubmit={(data) => { setStudents([{ ...data, id: `s${students.length+1}`, bus: data.route, stop: data.pickupPoint } as Student, ...students]); setIsAddOpen(false); toast.success("Added"); }} onCancel={() => setIsAddOpen(false)} /></DialogContent></Dialog>
      <Dialog open={!!editingStudent} onOpenChange={(o) => !o && setEditingStudent(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>{editingStudent && <StudentForm initialData={editingStudent} onSubmit={(data) => { setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...data, bus: data.route, stop: data.pickupPoint } : s)); setEditingStudent(null); toast.success("Updated"); }} onCancel={() => setEditingStudent(null)} />}</DialogContent></Dialog>
    </>
  );
  if (asTab) return inner;
  return <AppLayout title="Student Directory">{inner}</AppLayout>;
};

export default StudentsPage;
