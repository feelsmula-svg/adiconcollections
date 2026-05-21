"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Box,
  Button,
  Row,
  TextField,
} from "@/app/components/ui";

interface InventorySearchProps {
  initialQuery: string;
  tab: string;
}

export function InventorySearch({ initialQuery, tab }: InventorySearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function buildHref(query: string): string {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (query) params.set("q", query);
    return `/admin/inventory?${params.toString()}`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildHref(value.trim()));
  }

  function handleClear() {
    setValue("");
    router.push(buildHref(""));
  }

  return (
    <form onSubmit={handleSubmit} className="contents" noValidate>
      <Row gap="sm" className="flex-wrap">
        <Box className="flex-1 min-w-[200px]">
          <TextField
            value={value}
            placeholder="Search by name, type, or description…"
            onChange={(event) => setValue(event.target.value)}
          />
        </Box>
        <Button type="submit" variant="outline" caps={false}>
          Search
        </Button>
        {initialQuery ? (
          <Button
            type="button"
            variant="ghost"
            caps={false}
            onClick={handleClear}
          >
            Clear
          </Button>
        ) : null}
      </Row>
    </form>
  );
}
