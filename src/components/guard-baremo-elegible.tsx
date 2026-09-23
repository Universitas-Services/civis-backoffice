"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { esElegible } from "@/lib/elegibilidad";

/**
 * Solo permite el baremo de puntuación si el postulante fue declarado elegible.
 */
export function GuardBaremoElegible({
  candidateId,
  children,
}: {
  readonly candidateId: string;
  readonly children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!esElegible(candidateId)) {
      router.replace(`/evaluacion/${candidateId}`);
      return;
    }
    setOk(true);
  }, [candidateId, router]);

  if (ok !== true) {
    return (
      <div className="px-5 py-10 sm:px-8">
        <p className="text-sm text-toga-500">Comprobando elegibilidad…</p>
      </div>
    );
  }

  return <>{children}</>;
}
