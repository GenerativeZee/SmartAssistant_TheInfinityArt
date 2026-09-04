"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { S } from "@/lib/strings";

export function NewActionButtons() {
  const toast = useToast();
  return (
    <div className="grid grid-cols-2 gap-2 px-4 mt-3">
      <Button variant="surface" onClick={() => toast("Quotation builder M3 me aayega")}>
        {S.client.newQuotation}
      </Button>
      <Button variant="surface" onClick={() => toast("Job M4 me aayega")}>
        {S.client.newJob}
      </Button>
    </div>
  );
}
