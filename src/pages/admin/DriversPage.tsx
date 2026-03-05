import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { User as SteeringWheel, Plus, MoreVertical, Phone, CreditCard, Calendar as CalendarIcon, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Driver } from "@/types/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DriverForm } from "@/components/forms/DriverForm";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DriversPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: "d1", name: "Ahmad Khaled", phone: "01012345678", licenseNumber: "DRV-987654", licenseExpiry: "2026-12-10", assignedBus: "SB-101", status: "active", availability: "on-duty", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: "d2", name: "Sara Mostafa", phone: "01098765432", licenseNumber: "DRV-123456", licenseExpiry: "2026-05-22", assignedBus: "SB-102", status: "active", availability: "available", avatar: "https://i.pravatar.cc/150?img=32" },
    { id: "d3", name: "Omar Ramadan", phone: "01055667788", licenseNumber: "DRV-654321", licenseExpiry: "2025-11-15", assignedBus: "SB-103", status: "active", availability: "off-duty", avatar: "https://i.pravatar.cc/150?img=53" },
  ]);

  const handleDelete = (id: string) => { setDrivers(drivers.filter(d => d.id !== id)); toast.success("Driver deleted"); };
  const toggleStatus = (id: string) => { setDrivers(drivers.map(d => d.id === id ? { ...d, status: d.status === "active" ? "inactive" : "active" } : d)); toast.success("Status updated"); };

  const columns: ColumnDef<Driver>[] = [
    { accessorKey: "name", header: "Driver", cell: ({ row }) => (
      <div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarImage src={row.original.avatar} /><AvatarFallback className="gradient-primary text-primary-foreground font-bold">{row.original.name.charAt(0)}</AvatarFallback></Avatar><div className="flex flex-col"><span className="font-medium">{row.original.name}</span><span className="text-[10px] text-muted-foreground">ID: {row.original.id}</span></div></div>
    )},
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => <div className="flex items-center gap-1.5 text-sm"><Phone className="h-3 w-3 text-muted-foreground" />{row.original.phone}</div> },
    { accessorKey: "assignedBus", header: "Bus", cell: ({ row }) => <Badge variant="secondary" className="font-mono">{row.original.assignedBus}</Badge> },
    { accessorKey: "availability", header: "Availability", cell: ({ row }) => {
      const colors = { "available": "bg-success/10 text-success", "on-duty": "bg-primary/10 text-primary", "off-duty": "bg-muted text-muted-foreground" };
      return <Badge variant="outline" className={`capitalize text-[10px] ${colors[row.original.availability]}`}>{row.original.availability.replace("-"," ")}</Badge>;
    }},
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "outline"} className="capitalize text-[10px]">{row.original.status}</Badge> },
    { id: "actions", header: () => <div className="text-right">Actions</div>, cell: ({ row }) => (
      <div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setViewingDriver(row.original)}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setEditingDriver(row.original)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleStatus(row.original.id)}>{row.original.status === "active" ? <><UserX className="h-4 w-4 mr-2" /> Deactivate</> : <><UserCheck className="h-4 w-4 mr-2" /> Activate</>}</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
      </DropdownMenuContent></DropdownMenu></div>
    )},
  ];

  return (
    <AppLayout title="Driver Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2"><SteeringWheel className="h-6 w-6 text-primary" />Drivers</h2>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border border-border/50 p-4">
          <DataTable columns={columns} data={drivers} searchKey="name" searchPlaceholder="Search drivers..." />
        </motion.div>
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Add Driver</DialogTitle></DialogHeader><DriverForm onSubmit={(data) => { setDrivers([{ ...data, id: `d${drivers.length+1}`, licenseExpiry: data.licenseExpiry.toISOString().split("T")[0] }, ...drivers]); setIsAddOpen(false); toast.success("Added"); }} onCancel={() => setIsAddOpen(false)} /></DialogContent></Dialog>
      <Dialog open={!!editingDriver} onOpenChange={(o) => !o && setEditingDriver(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Driver</DialogTitle></DialogHeader>{editingDriver && <DriverForm initialData={editingDriver} onSubmit={(data) => { setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, ...data, licenseExpiry: data.licenseExpiry instanceof Date ? data.licenseExpiry.toISOString().split("T")[0] : data.licenseExpiry } : d)); setEditingDriver(null); toast.success("Updated"); }} onCancel={() => setEditingDriver(null)} />}</DialogContent></Dialog>
      <Sheet open={!!viewingDriver} onOpenChange={(o) => !o && setViewingDriver(null)}><SheetContent className="sm:max-w-md"><SheetHeader><SheetTitle>Driver Profile</SheetTitle></SheetHeader>{viewingDriver && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4"><Avatar className="h-24 w-24"><AvatarImage src={viewingDriver.avatar} /><AvatarFallback className="text-2xl gradient-primary text-primary-foreground font-bold">{viewingDriver.name.charAt(0)}</AvatarFallback></Avatar><div className="text-center"><h3 className="text-xl font-bold">{viewingDriver.name}</h3><Badge variant="outline" className="mt-1">ID: {viewingDriver.id}</Badge></div></div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span><span className="font-medium">{viewingDriver.phone}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> License</span><span className="font-medium">{viewingDriver.licenseNumber}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Expiry</span><span className="font-medium">{viewingDriver.licenseExpiry}</span></div>
          </div>
          <Button className="w-full" onClick={() => { setEditingDriver(viewingDriver); setViewingDriver(null); }}><Edit className="h-4 w-4 mr-2" /> Edit Profile</Button>
        </div>
      )}</SheetContent></Sheet>
    </AppLayout>
  );
};

export default DriversPage;
