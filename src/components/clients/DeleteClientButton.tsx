"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { deleteClient } from "@/lib/actions/clients";

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteClient(clientId);
      if (!res.ok) {
        toast(res.error, "err");
        setOpen(false);
        return;
      }
      toast(`Deleted · ${clientName}`);
      router.push("/clients");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-center text-xs text-ink-faint underline"
      >
        Delete client
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Delete this client?">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">
            This permanently deletes <span className="text-ink font-medium">{clientName}</span> and their
            visit history. This can&rsquo;t be undone. Clients with quotations, jobs or payments can&rsquo;t
            be deleted this way — resolve those first.
          </p>
          <Button variant="danger" onClick={confirmDelete} disabled={pending} className="w-full">
            {pending ? "Deleting…" : "Delete client"}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
