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
  status: "Draft" | "Submitted" | "In Review" | "Approved";
  updated: string;
  assignedInstallerId: string | null;
  ownerEmail: string;
  priceOffer: string;
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
  createOrder: (id: string, asset: string, power: string, ownerEmail: string, priceOffer: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  assignInstaller: (orderId: string, installerId: string | null) => void;
  acceptOffer: (orderId: string, installerId: string) => void;
  updateOrderDocumentStatus: (orderId: string, docId: string, status: DocumentItem["status"]) => void;
  approveInstaller: (installerId: string) => void;
  rejectInstaller: (installerId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [
  {
    id: "pv-halle-nord",
    asset: "PV Rooftop Installation (North)",
    power: "9.8 kWp",
    status: "In Review",
    updated: "26.06.2026",
    assignedInstallerId: "inst-1",
    ownerEmail: "user1@connect-now.io",
    priceOffer: "1,200 €",
    documents: [
      { id: "e8", label: "Inverter Datasheet (E.8)", status: "complete" },
      { id: "lageplan", label: "Site Plan / Schematic Diagram", status: "complete" },
      { id: "messkonzept", label: "Metering Concept", status: "review" },
      { id: "vollmacht", label: "Operator Power of Attorney", status: "missing" },
    ],
  },
  {
    id: "solar-speicher-sued",
    asset: "PV with Storage (South)",
    power: "12.4 kWp",
    status: "Submitted",
    updated: "24.06.2026",
    assignedInstallerId: "inst-3",
    ownerEmail: "user1@connect-now.io",
    priceOffer: "1,800 €",
    documents: [
      { id: "e8", label: "Inverter Datasheet (E.8)", status: "review" },
      { id: "lageplan", label: "Site Plan / Schematic Diagram", status: "complete" },
      { id: "messkonzept", label: "Metering Concept", status: "complete" },
      { id: "vollmacht", label: "Operator Power of Attorney", status: "complete" },
    ],
  },
  {
    id: "wp-hof-sued",
    asset: "PV + Heat Pump",
    power: "15.0 kWp",
    status: "Draft",
    updated: "20.06.2026",
    assignedInstallerId: "inst-1",
    ownerEmail: "user2@connect-now.io",
    priceOffer: "2,200 €",
    documents: [
      { id: "e8", label: "Inverter Datasheet (E.8)", status: "missing" },
      { id: "lageplan", label: "Site Plan / Schematic Diagram", status: "missing" },
      { id: "messkonzept", label: "Metering Concept", status: "complete" },
      { id: "vollmacht", label: "Operator Power of Attorney", status: "missing" },
    ],
  },
  {
    id: "pv-schulstrasse",
    asset: "Elementary School Rooftop",
    power: "29.5 kWp",
    status: "Draft",
    updated: "22.06.2026",
    assignedInstallerId: null,
    ownerEmail: "user2@connect-now.io",
    priceOffer: "3,500 €",
    documents: [
      { id: "e8", label: "Inverter Datasheet (E.8)", status: "missing" },
      { id: "lageplan", label: "Site Plan / Schematic Diagram", status: "complete" },
      { id: "messkonzept", label: "Metering Concept", status: "missing" },
      { id: "vollmacht", label: "Operator Power of Attorney", status: "missing" },
    ],
  },
];

const INITIAL_INSTALLERS: Installer[] = [
  {
    id: "inst-1",
    name: "Max Weber",
    company: "Weber Solar Technology GmbH",
    certified: true,
    region: "06108 Halle",
    rating: "⭐️ 4.9 (142)",
  },
  {
    id: "inst-2",
    name: "Solar East Support",
    company: "Solar East GmbH",
    certified: false,
    region: "10115 Berlin",
    rating: "New",
  },
  {
    id: "inst-3",
    name: "Alex Wagner",
    company: "Wagner Electrical Services",
    certified: true,
    region: "80331 Munich",
    rating: "⭐️ 4.7 (38)",
  },
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [installers, setInstallers] = useState<Installer[]>([]);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("connectNowOrders_v2");
      const storedInstallers = localStorage.getItem("connectNowInstallers_v2");

      if (storedOrders) {
        // Migration safeguard: check if stored order objects have ownerEmail, priceOffer or old German statuses
        const parsed = JSON.parse(storedOrders) as Order[];
        const needsMigration = parsed.some(
          o => !o.ownerEmail || !o.priceOffer || o.status === ("Entwurf" as any) || o.status === ("Eingereicht" as any)
        );
        
        if (needsMigration) {
          localStorage.setItem("connectNowOrders_v2", JSON.stringify(INITIAL_ORDERS));
          setOrders(INITIAL_ORDERS);
        } else {
          setOrders(parsed);
        }
      } else {
        localStorage.setItem("connectNowOrders_v2", JSON.stringify(INITIAL_ORDERS));
        setOrders(INITIAL_ORDERS);
      }

      if (storedInstallers) {
        setInstallers(JSON.parse(storedInstallers) as Installer[]);
      } else {
        localStorage.setItem("connectNowInstallers_v2", JSON.stringify(INITIAL_INSTALLERS));
        setInstallers(INITIAL_INSTALLERS);
      }
    } catch (e) {
      console.error("Failed to load project database", e);
    }
  }, []);

  // Sync logged-in installer to the registry
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("connectNowUser");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u && u.role === "installer" && u.installerId) {
          const exists = installers.some(i => i.id === u.installerId);
          if (!exists && installers.length > 0) {
            const newInst: Installer = {
              id: u.installerId,
              name: `${u.firstName} ${u.lastName}`,
              company: u.firstName.includes("Weber") ? "Weber Solar" : "Custom Electrician Ltd",
              certified: false, // default pending
              region: "06108 Halle",
              rating: "New",
            };
            const updated = [...installers, newInst];
            localStorage.setItem("connectNowInstallers_v2", JSON.stringify(updated));
            setInstallers(updated);
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync logged-in installer", e);
    }
  }, [installers]);

  const createOrder = (id: string, asset: string, power: string, ownerEmail: string, priceOffer: string) => {
    const newOrder: Order = {
      id: id,
      asset: asset,
      power: power,
      status: "Draft",
      updated: new Date().toLocaleDateString("en-US"),
      assignedInstallerId: null,
      ownerEmail: ownerEmail,
      priceOffer: priceOffer,
      documents: [
        { id: "e8", label: "Inverter Datasheet (E.8)", status: "missing" },
        { id: "lageplan", label: "Site Plan / Schematic Diagram", status: "missing" },
        { id: "messkonzept", label: "Metering Concept", status: "missing" },
        { id: "vollmacht", label: "Operator Power of Attorney", status: "missing" },
      ],
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem("connectNowOrders_v2", JSON.stringify(updated));
    setOrders(updated);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: status,
          updated: new Date().toLocaleDateString("en-US"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders_v2", JSON.stringify(updated));
    setOrders(updated);
  };

  const assignInstaller = (orderId: string, installerId: string | null) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          assignedInstallerId: installerId,
          updated: new Date().toLocaleDateString("en-US"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders_v2", JSON.stringify(updated));
    setOrders(updated);
  };

  const acceptOffer = (orderId: string, installerId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          assignedInstallerId: installerId,
          updated: new Date().toLocaleDateString("en-US"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders_v2", JSON.stringify(updated));
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
          updated: new Date().toLocaleDateString("en-US"),
        };
      }
      return o;
    });
    localStorage.setItem("connectNowOrders_v2", JSON.stringify(updated));
    setOrders(updated);
  };

  const approveInstaller = (installerId: string) => {
    const updated = installers.map((i) => {
      if (i.id === installerId) {
        return { ...i, certified: true };
      }
      return i;
    });
    localStorage.setItem("connectNowInstallers_v2", JSON.stringify(updated));
    setInstallers(updated);
  };

  const rejectInstaller = (installerId: string) => {
    const target = installers.find((i) => i.id === installerId);
    let updated;
    if (target && !target.certified) {
      // Pending installer gets deleted entirely
      updated = installers.filter((i) => i.id !== installerId);
    } else {
      // Certified installer gets demoted to uncertified / pending
      updated = installers.map((i) => {
        if (i.id === installerId) {
          return { ...i, certified: false };
        }
        return i;
      });
    }
    localStorage.setItem("connectNowInstallers_v2", JSON.stringify(updated));
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
        acceptOffer,
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
