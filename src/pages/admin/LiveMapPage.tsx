import AppLayout from "@/components/layout/AppLayout";
import MapView from "@/components/map/MapView";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { mockBusLocations } from "@/utils/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, MapPin, Users, Clock, ChevronRight, Search, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LiveMapPage = () => {
  const { busLocations, setBusLocations } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setBusLocations(mockBusLocations); }, [setBusLocations]);

  const filteredBuses = busLocations.filter((bus) =>
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.driverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout title="Live Tracking Map">
      <div className="flex h-[calc(100vh-120px)] w-full rounded-xl overflow-hidden border border-border/50 bg-background relative">
        <div className="flex-1 relative">
          <MapView buses={busLocations} fullScreen />
          {!isSidebarOpen && (
            <Button variant="secondary" size="icon" className="absolute top-4 left-4 z-10 shadow-lg" onClick={() => setIsSidebarOpen(true)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="w-80 border-l border-border/50 bg-background flex flex-col">
              <div className="p-4 border-b border-border/50 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><Bus className="h-4 w-4 text-primary" /> Live Trips</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Search buses..." className="pl-7 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredBuses.length > 0 ? filteredBuses.map((bus) => (
                  <div key={bus.busId} className="p-3 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/20 transition cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <div><p className="text-sm font-bold">{bus.busNumber}</p><p className="text-xs text-muted-foreground">{bus.routeName}</p></div>
                      <Badge variant="default" className="text-xs">{bus.status}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{bus.occupancy}/{bus.capacity}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{bus.eta} min</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium"><MapPin className="h-3 w-3 text-primary" />Next: {bus.nextStop}</div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-muted-foreground text-xs"><AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-20" />No active trips found</div>
                )}
              </div>
              <div className="p-4 border-t border-border/50 text-xs">
                <div className="flex justify-between"><span>Active Buses</span><span className="font-bold">{busLocations.filter((b) => b.status !== "idle").length}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default LiveMapPage;
