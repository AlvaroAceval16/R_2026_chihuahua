import { Suspense } from "react";
import { notFound } from "next/navigation";
import plant from "@/data/plant.json";
import { PlantMachine } from "@/types/machine";
import MachineLive from "./machine-live";

const machines = plant as PlantMachine[];

export function generateStaticParams() {
  return machines.map((machine) => ({ id: machine.machineId }));
}

export default function MachinePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-8 py-10 text-sm text-gray-400">Cargando máquina</p>}>
      <MachineDetail params={params} />
    </Suspense>
  );
}

async function MachineDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machine = machines.find((item) => item.machineId === id);

  if (!machine) {
    notFound();
  }

  return <MachineLive initial={machine} />;
}
