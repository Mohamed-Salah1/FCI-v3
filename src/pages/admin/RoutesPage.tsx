import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { MapPin, Plus, MoreVertical, Bus, Edit, Trash2, Map as MapIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/types/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RouteForm } from "@/components/forms/RouteForm";
import { toast } from "sonner";


interface Props { asTab?: boolean }

const RoutesPage = ({ asTab }: Props) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([
    { id: "r1", name: "Route Alpha", assignedBus: "SB-101", stops: ["Al Ustad St", "Al Geish St North", "University Gate"], status: "active" },
    { id: "r2", name: "Route Beta", assignedBus: "SB-102", stops: ["Al Geish St North", "Al Geish St Central", "University Gate"], status: "active" },
    { id: "r3", name: "Route Gamma", assignedBus: "SB-103", stops: ["West District", "Gen. Gamal Hamad St", "University Gate"], status: "inactive" },
  ]);

  const handleDelete = (id: string) => { setRoutes(routes.filter(r => r.id !== id)); toast.success("Route deleted"); };

  const columns: ColumnDef<Route>[] = [
    { accessorKey: "name", header: "Route Name", cell: ({ row }) => <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MapIcon className="h-5 w-5" /></div><span className="font-bold">{row.original.name}</span></div> },
    { accessorKey: "assignedBus", header: "Bus", cell: ({ row }) => <div className="flex items-center gap-1.5 text-sm"><Bus className="h-3.5 w-3.5 text-muted-foreground" /><Badge variant="secondary">{row.original.assignedBus}</Badge></div> },
    { accessorKey: "stops", header: "Stops", cell: ({ row }) => <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-hidden max-w-[300px]">{row.original.stops.map((stop, i) => <React.Fragment key={i}><span className="whitespace-nowrap">{stop}</span>{i < row.original.stops.length - 1 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}</React.Fragment>)}</div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "outline"} className="capitalize text-[10px]">{row.original.status}</Badge> },
    { id: "actions", header: () => <div className="text-right">Actions</div>, cell: ({ row }) => (
      <div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setEditingRoute(row.original)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem><DropdownMenuItem><MapPin className="h-4 w-4 mr-2" /> View on Map</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    )},
  ];

  const inner = (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2"><MapIcon className="h-6 w-6 text-primary" />Routes</h2>
          <Button onClick={() => setIsAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Create Route</Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl border border-border/50 p-4">
          <DataTable columns={columns} data={routes} searchKey="name" searchPlaceholder="Search routes..." />
        </motion.div>
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Create Route</DialogTitle></DialogHeader><RouteForm onSubmit={(data) => { setRoutes([{ ...data, id: `r${routes.length+1}`, stops: data.stops.map((s: any) => s.name) }, ...routes]); setIsAddOpen(false); toast.success("Created"); }} onCancel={() => setIsAddOpen(false)} /></DialogContent></Dialog>
      <Dialog open={!!editingRoute} onOpenChange={(o) => !o && setEditingRoute(null)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Route</DialogTitle></DialogHeader>{editingRoute && <RouteForm initialData={editingRoute} onSubmit={(data) => { setRoutes(routes.map(r => r.id === editingRoute.id ? { ...r, ...data, stops: data.stops.map((s: any) => s.name) } : r)); setEditingRoute(null); toast.success("Updated"); }} onCancel={() => setEditingRoute(null)} />}</DialogContent></Dialog>
    </>
  );
  if (asTab) return inner;
  return <AppLayout title="Route Management">{inner}</AppLayout>;
};

export default RoutesPage;
