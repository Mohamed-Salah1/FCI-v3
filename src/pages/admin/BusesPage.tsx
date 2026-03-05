import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bus as BusIcon, Plus, MoreVertical, Users, MapPin, Edit, Trash2, Settings, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Bus } from "@/types/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BusForm } from "@/components/forms/BusForm";
import { toast } from "sonner";

const BusesPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [buses, setBuses] = useState<Bus[]>([
    { id: "b1", busNumber: "SB-101", capacity: 35, plateNumber: "ABC-1234", assignedDriver: "Ahmad Khaled", route: "Route Alpha", status: "active" },
    { id: "b2", busNumber: "SB-102", capacity: 30, plateNumber: "XYZ-5678", assignedDriver: "Sara Mostafa", route: "Route Beta", status: "active" },
    { id: "b3", busNumber: "SB-103", capacity: 40, plateNumber: "LMN-9012", assignedDriver: "Omar Ramadan", route: "Route Gamma", status: "maintenance" },
    { id: "b4", busNumber: "SB-104", capacity: 35, plateNumber: "QRS-3456", assignedDriver: "Lina H.", route: "Route Delta", status: "active" },
  ]);

  const handleDelete = (id: string) => { setBuses(buses.filter(b => b.id !== id)); toast.success("Bus removed"); };

  const columns: ColumnDef<Bus>[] = [
    { accessorKey: "busNumber", header: "Bus Number", cell: ({ row }) => (
      <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BusIcon className="h-5 w-5" /></div><div className="flex flex-col"><span className="font-bold">{row.original.busNumber}</span><span className="text-[10px] text-muted-foreground font-mono">{row.original.plateNumber}</span></div></div>
    )},
    { accessorKey: "capacity", header: "Capacity", cell: ({ row }) => <div className="flex items-center gap-1.5 text-sm"><Users className="h-3.5 w-3.5 text-muted-foreground" />{row.original.capacity} seats</div> },
    { accessorKey: "assignedDriver", header: "Driver" },
    { accessorKey: "route", header: "Route", cell: ({ row }) => <div className="flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{row.original.route}</div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => {
      const cfg = { active: { label: "Active", variant: "default" as const, icon: ShieldCheck }, maintenance: { label: "Maintenance", variant: "secondary" as const, icon: Settings }, inactive: { label: "Inactive", variant: "outline" as const, icon: AlertCircle } };
      const c = cfg[row.original.status] || cfg.inactive;
      return <Badge variant={c.variant} className="gap-1 px-2 py-0.5"><c.icon className="h-3 w-3" />{c.label}</Badge>;
    }},
    { id: "actions", header: () => <div className="text-right">Actions</div>, cell: ({ row }) => (
      <div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditingBus(row.original)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    )},
  ];

  return (
    <AppLayout title="Fleet Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2"><BusIcon className="h-6 w-6 text-primary" />Buses</h2>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Bus</Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border border-border/50 p-4">
          <DataTable columns={columns} data={buses} searchKey="busNumber" searchPlaceholder="Search by bus number..." />
        </motion.div>
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Add New Bus</DialogTitle></DialogHeader><BusForm onSubmit={(data) => { setBuses([{ ...data, id: `b${buses.length+1}` } as Bus, ...buses]); setIsAddOpen(false); toast.success("Bus added"); }} onCancel={() => setIsAddOpen(false)} /></DialogContent></Dialog>
      <Dialog open={!!editingBus} onOpenChange={(o) => !o && setEditingBus(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Bus</DialogTitle></DialogHeader>{editingBus && <BusForm initialData={editingBus} onSubmit={(data) => { setBuses(buses.map(b => b.id === editingBus.id ? { ...b, ...data } : b)); setEditingBus(null); toast.success("Updated"); }} onCancel={() => setEditingBus(null)} />}</DialogContent></Dialog>
    </AppLayout>
  );
};

export default BusesPage;
