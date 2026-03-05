import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRecord } from "@/types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  present: "default",
  absent: "destructive",
  late: "secondary",
};

const AttendanceTable = ({ records }: AttendanceTableProps) => {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold">Attendance Records</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Bus</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.studentName}</TableCell>
              <TableCell>{record.busNumber}</TableCell>
              <TableCell>{record.boardingTime}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[record.status]}>
                  {record.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTable;
