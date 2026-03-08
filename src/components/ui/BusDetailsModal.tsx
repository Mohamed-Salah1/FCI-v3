import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Zap, Users } from "lucide-react";
import { MOCK_STUDENTS } from "@/utils/mapData";

interface BusDetailsModalProps {
  bus: any;
  onClose: () => void;
}

const BusDetailsModal = ({ bus, onClose }: BusDetailsModalProps) => {
  const assignedStudents = MOCK_STUDENTS.filter((s) => s.assignedBusId === bus.id);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: bus.colorHex }} />
            {bus.number} — {bus.driverName}
          </DialogTitle>
        </DialogHeader>

        {/* Bus Info */}
        <div className="flex gap-6 text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {assignedStudents.length} students
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4" /> {bus.speed} km/h
          </span>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
          {assignedStudents.map((student) => (
            <div
              key={student.id}
              className="flex flex-col items-center text-xs bg-secondary/10 p-2 rounded-lg hover:bg-secondary/20 transition"
            >
              <img
                src={student.avatar || `https://i.pravatar.cc/40?u=${student.id}`}
                alt={student.name}
                className="w-12 h-12 rounded-full mb-1 object-cover"
              />
              <span className="text-center">{student.name}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusDetailsModal;
