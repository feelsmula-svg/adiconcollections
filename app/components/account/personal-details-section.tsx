"use client";

import { useState } from "react";

import {
  Box,
  Button,
  Heading,
  Row,
  Stack,
  Text,
} from "@/app/components/ui";
import { useProfileStore } from "@/app/lib/state/profile-store";
import { useHydrated } from "@/app/lib/state/hydration";
import { EditProfileModal } from "./edit-profile-modal";

interface PersonalDetailsSectionProps {
  name: string;
  email: string;
}

const PLACEHOLDER_PHONE = "+1 (555) 012-3456";

export function PersonalDetailsSection({
  name,
  email,
}: PersonalDetailsSectionProps) {
  const hydrated = useHydrated();
  const storedName = useProfileStore((state) => state.name);
  const storedPhone = useProfileStore((state) => state.phone);
  const [editing, setEditing] = useState(false);

  const displayName =
    hydrated && storedName ? storedName : name || "Not added";
  const phone = hydrated && storedPhone ? storedPhone : PLACEHOLDER_PHONE;

  return (
    <>
      <Stack gap="lg">
        <Row
          justify="between"
          align="end"
          className="pb-sm border-b border-outline-variant"
        >
          <Heading
            level={2}
            variant="headline-md"
            size="headline-sm"
            className="md:text-headline-md"
          >
            Personal Details
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            caps={false}
            onClick={() => setEditing(true)}
          >
            Edit profile
          </Button>
        </Row>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <DetailField label="Full name" value={displayName} />
          <DetailField label="Email address" value={email} />
          <DetailField label="Phone number" value={phone} />
        </Box>
      </Stack>
      <EditProfileModal
        open={editing}
        onClose={() => setEditing(false)}
        defaultName={displayName === "Not added" ? "" : displayName}
        defaultEmail={email}
      />
    </>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Stack gap="xs">
      <Text
        variant="label-caps"
        tone="muted"
        as="span"
        className="tracking-[0.18em]"
      >
        {label}
      </Text>
      <Text variant="body-lg" className="text-on-surface">
        {value}
      </Text>
    </Stack>
  );
}
