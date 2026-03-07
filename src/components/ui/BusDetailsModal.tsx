import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Zap, Users, MapPin } from "lucide-react";
import { MOCK_STUDENTS } from "@/utils/mapData";

interface BusDetailsModalProps {
  bus: any;
  onClose: () => void;
}

const BusDetailsModal = ({ bus, onClose }: BusDetailsModalProps) => {
  const assignedStudents = MOCK_STUDENTS.filter(
    (s) => s.assignedBusId === bus.id
  );

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-background p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-bold flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: bus.colorHex }} />
                    {bus.number} — {bus.driverName}
                  </Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-muted/20">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Bus Info */}
                <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {assignedStudents.length} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" /> {bus.speed} km/h
                  </span>
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default BusDetailsModal;