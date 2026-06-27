"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface DocumentItem {
  id: string;
  label: string;
  status: "complete" | "missing" | "review";
}

export interface Order {
  id: string;
  asset: string;
  power: string;
  status: "Entwurf" | "Eingereicht" | "In Prüfung" | "Genehmigt";
  updated: string;
  assignedInstallerId: string | null;
  documents: DocumentItem[];
}

export interface Installer {
  id: string;
  name: string;
  company: string;
  certified: boolean;
  region: string;
  rating: string;
}

interface ProjectContextType {
  orders: Order[];
  installers: Installer[];
  createOrder: (id: string, asset: string, power: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  assignInstaller: (orderId: string, installerId: string | null) => void;
  updateOrderDocumentStatus: (orderId: string, docId: string, status: DocumentItem["status"]) => void;
  approveInstaller: (installerId: string) => void;
  rejectInstaller: (installerId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [
  {
    id: "123",
    asset: "PV-Aufdachanlage",
    power: "9,8 kWp",
    status: "In Prüfung",
    updated: "26.06.2026",
    assignedInstallerId: "inst-1",
    documents: [
      { id: "e8", label: "Datenblatt Wechselrichter (E.8)", status: "complete" },
      { id: "lageplan", label: "Lageplan / Übersichtsschaltplan", status: "complete" },
      { id: "messkonzept", label: "Messkonzept", status: "review" },
      { id: "vollmacht", label: "Vollmacht des Anlagenbetreibers", status: "missing" },
    ],
  },
  {
    id: "PV-Solar-2026",
    asset: "PV mit Speicher",
    power: "12,4 kWp",
    status: "Eingereicht",
    updated: "24.06.2026",
    assignedInstallerId: null,
    documents: [
      { id: "e8", label: "Datenblatt Wechselrichter (E.8)", status: "review" },
      { id: "lageplan", label: "Lageplan / Übersichtsschaltplan", status: "complete" },
      { id: "messkonzept", label: "Messkonzept", status: "complete" },
      { id: "vollmacht", label: "Vollmacht des Anlagenbetreibers", status: "complete" },
    ],
  },
  {
    id: "Hof-Nord-WP",
    asset: "PV + Wärmepumpe",
    power: "15,0 kWp",
    status: "Entwurf",
    updated: "20.06.2026",
    assignedInstallerId: null,
    documents: [
      { id: "e8", label: "Datenblatt Wechselrichter (E.8)", status: "missing" },
      { id: "lageplan", label: "Lageplan / Übersichtsschaltplan", status: "missing" },
      { id: "messkonzept", label: "Messkonzept", status: "complete" },
      { id: "vollmacht", label: "Vollmacht des Anlagenbetreibers", status: "missing" },
    ],
  },
];

const INITIAL_INSTALLERS: Installer[] = [
  {
    id: "inst-1",
    name: "Max Weber",
    company: "Weber Solartechnik GmbH",
    certified: true,
    region: "06108 Halle",
    rating: "⭐️ 4.9 (142)",
  },
  {
    id: "inst-2",
    name: "Solar Ost Support",
    company: "Solar Ost GmbH",
    certified: false,
    region: "10115 Berlin",
    rating: "Neu",
  },
  {
    id: "inst-3",
    name: "Alex Wagner",
    company: "Wagner Elektro-Dienstleistungen",
    certified: true,
    region: "80331 München",
    rating: "⭐️ 4.7 (38)",
  },
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [installers, setInstallers] = useState<Installer[]>([]);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("connectNowOrders");
      const storedInstallers = localStorage.getItem("connectNowInstallers");

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders) as Order[]);
      } else {
        localStorage.setItem("connectNowOrders", JSON.stringify(INITIAL_ORDERS));
        setOrders(INITIAL_ORDERS);
      }

      if (storedInstallers) {
        setInstallers(JSON.parse(storedInstallers) as Installer[]);
      } else {
        localStorage.setItem("connectNowInstallers", JSON.stringify(INITIAL_INSTALLERS));
        setInstallers(INITIAL_INSTALLERS);
      }
    } catch (e) {
      console.error("Failed to load project database", e);
    }
  }, []);

  const createOrder = (id: string, asset: string, power: string) => {
    const newOrder: Order = {
      id: id,
      asset: asset,
      power: power,
      status: "Entwurf",
      updated: new Date().toLocaleDateString("de-DE"),
      assignedInstallerId: null,
      documents: [
        { id: "e8", label: "Datenblatt Wechselrichter (E.8)", status: "missing" },
        { id: "lageplan", label: "Lageplan / Übersichtsschaltplan", status: "missing" },
        { id: "messkonzept", label: "Messkonzept", status: "missing" },
        { id: "vollmacht", label: "Vollmacht des Anlagenbetreibers", status: "missing" },
      ],
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem("connectNowOrders", JSON.stringify(updated));
    setOrders(updated);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: status,
          updated: new Date().toLocaleDateString("de-DE"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders", JSON.stringify(updated));
    setOrders(updated);
  };

  const assignInstaller = (orderId: string, installerId: string | null) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          assignedInstallerId: installerId,
          updated: new Date().toLocaleDateString("de-DE"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders", JSON.stringify(updated));
    setOrders(updated);
  };

  const updateOrderDocumentStatus = (orderId: string, docId: string, status: DocumentItem["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const updatedDocs = o.documents.map((d) => {
          if (d.id === docId) {
            return { ...d, status: status };
          }
          return d;
        });
        return {
          ...o,
          documents: updatedDocs,
          updated: new Date().toLocaleDateString("de-DE"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders", JSON.stringify(updated));
    setOrders(updated);
  };

  const approveInstaller = (installerId: string) => {
    const updated = installers.map((i) => {
      if (i.id === installerId) {
        return { ...i, certified: true };
      }
      return i;
    });
    localStorage.setItem("connectNowInstallers", JSON.stringify(updated));
    setInstallers(updated);
  };

  const rejectInstaller = (installerId: string) => {
    const updated = installers.map((i) => {
      if (i.id === installerId) {
        return { ...i, certified: false };
      }
      return i;
    });
    localStorage.setItem("connectNowInstallers", JSON.stringify(updated));
    setInstallers(updated);
  };

  return (
    <ProjectContext.Provider
      value={{
        orders,
        installers,
        createOrder,
        updateOrderStatus,
        assignInstaller,
        updateOrderDocumentStatus,
        approveInstaller,
        rejectInstaller,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
