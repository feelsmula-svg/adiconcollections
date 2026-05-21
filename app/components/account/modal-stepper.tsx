"use client";

import { Fragment } from "react";

import { Box, Row, Stack, Text } from "@/app/components/ui";
import { cn } from "@/app/components/ui/cn";

export interface ModalStep {
  key: string;
  label: string;
}

interface ModalStepperProps {
  steps: ModalStep[];
  current: number;
}

export function ModalStepper({ steps, current }: ModalStepperProps) {
  return (
    <Stack gap="sm">
      <Row gap="xs" align="center" className="w-full">
        {steps.map((step, i) => {
          const reached = i <= current;
          const isCurrent = i === current;
          return (
            <Fragment key={step.key}>
              <Box
                className={cn(
                  "flex items-center justify-center rounded-full shrink-0 transition-colors",
                  reached
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant",
                  isCurrent ? "w-7 h-7 ring-4 ring-primary/15" : "w-6 h-6",
                )}
              >
                <Text
                  variant="label-caps"
                  as="span"
                  className={cn(
                    "text-[11px]",
                    reached ? "text-on-primary" : "text-on-surface-variant",
                  )}
                >
                  {i + 1}
                </Text>
              </Box>
              {i < steps.length - 1 ? (
                <Box
                  className={cn(
                    "h-px flex-1 transition-colors",
                    i < current ? "bg-primary" : "bg-outline-variant",
                  )}
                />
              ) : null}
            </Fragment>
          );
        })}
      </Row>
      <Row justify="between" align="center" gap="xs">
        <Text
          variant="label-caps"
          tone="muted"
          as="span"
          className="tracking-[0.18em]"
        >
          Step {current + 1} of {steps.length}
        </Text>
        <Text variant="body-sm" as="span" className="font-semibold">
          {steps[current]?.label ?? ""}
        </Text>
      </Row>
    </Stack>
  );
}
