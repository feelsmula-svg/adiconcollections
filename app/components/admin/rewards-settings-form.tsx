"use client";

import {
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormField,
  Heading,
  Icon,
  IconButton,
  Row,
  Stack,
  Text,
  TextField,
} from "@/app/components/ui";
import { updateRewardsSettings } from "@/app/lib/settings/rewards/actions";
import type {
  RewardsSettings,
  RewardsTier,
} from "@/app/lib/settings/rewards/types";

interface DraftTier {
  uiKey: string;
  id: string;
  label: string;
  points: string;
  blurb: string;
}

function tierToDraft(tier: RewardsTier, index: number): DraftTier {
  return {
    uiKey: `${tier.id || "tier"}-${index}`,
    id: tier.id,
    label: tier.label,
    points: String(tier.points),
    blurb: tier.blurb ?? "",
  };
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueId(base: string, existing: ReadonlyArray<DraftTier>): string {
  let candidate = base || "tier";
  let n = 2;
  while (existing.some((tier) => tier.id === candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

interface RewardsSettingsFormProps {
  settings: RewardsSettings;
}

export function RewardsSettingsForm({ settings }: RewardsSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(settings.enabled);
  const [displayToCustomers, setDisplayToCustomers] = useState(
    settings.displayToCustomers,
  );
  const [pointsPerDollar, setPointsPerDollar] = useState(
    String(settings.pointsPerDollar),
  );
  const [tiers, setTiers] = useState<DraftTier[]>(() =>
    settings.tiers.map(tierToDraft),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  useEffect(() => {
    setEnabled(settings.enabled);
    setDisplayToCustomers(settings.displayToCustomers);
    setPointsPerDollar(String(settings.pointsPerDollar));
    setTiers(settings.tiers.map(tierToDraft));
  }, [settings]);

  const updateTier = <K extends keyof DraftTier>(
    uiKey: string,
    key: K,
    value: DraftTier[K],
  ) => {
    setTiers((prev) =>
      prev.map((tier) =>
        tier.uiKey === uiKey ? { ...tier, [key]: value } : tier,
      ),
    );
  };

  const handleAddTier = () => {
    const id = uniqueId("tier", tiers);
    setTiers((prev) => [
      ...prev,
      {
        uiKey: `new-${Date.now()}-${prev.length}`,
        id,
        label: "",
        points: "100",
        blurb: "",
      },
    ]);
  };

  const handleRemoveTier = (uiKey: string) => {
    setTiers((prev) => prev.filter((tier) => tier.uiKey !== uiKey));
  };

  const handleLabelBlur = (uiKey: string) => {
    setTiers((prev) =>
      prev.map((tier) => {
        if (tier.uiKey !== uiKey) return tier;
        if (tier.id.trim().length > 0) return tier;
        const base = slug(tier.label);
        if (!base) return tier;
        const existing = prev.filter((t) => t.uiKey !== uiKey);
        return { ...tier, id: uniqueId(base, existing) };
      }),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setErrorMessage(null);
    setFieldErrors({});
    setFeedback(null);

    const parsedPoints = Number(pointsPerDollar);
    const cleanedTiers = tiers.map((tier) => ({
      id: tier.id.trim() || slug(tier.label) || `tier-${Date.now()}`,
      label: tier.label,
      points: Number(tier.points),
      blurb: tier.blurb,
    }));

    startTransition(async () => {
      const result = await updateRewardsSettings({
        enabled,
        displayToCustomers,
        pointsPerDollar: Number.isFinite(parsedPoints) ? parsedPoints : 0,
        tiers: cleanedTiers,
      });
      if (!result.ok) {
        setErrorMessage(result.error ?? "Could not save settings");
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setFeedback("Rewards settings updated");
      router.refresh();
    });
  };

  return (
    <Card variant="outlined" padding="lg" rounded="2xl">
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="lg">
          <Stack gap="xs">
            <Row align="center" gap="sm">
              <Box className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <Icon
                  name="loyalty"
                  filled
                  className="text-on-primary-container"
                />
              </Box>
              <Stack gap="none" className="flex-1">
                <Heading level={2} variant="headline-sm">
                  Customer rewards
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Toggle the rewards program, control how many points
                  customers earn, and manage the redeemable tiers.
                </Text>
              </Stack>
              <Badge
                tone={
                  enabled && displayToCustomers
                    ? "primary"
                    : enabled
                      ? "secondary"
                      : "neutral"
                }
                size="sm"
              >
                {enabled
                  ? displayToCustomers
                    ? "Active"
                    : "Active · Hidden"
                  : "Disabled"}
              </Badge>
            </Row>
          </Stack>

          <Stack gap="sm">
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Stack gap="xs">
                <Checkbox
                  checked={enabled}
                  onChange={(checked) => setEnabled(checked)}
                  disabled={pending}
                  label="Enable rewards program (customers earn points on purchases)"
                />
                <Box className="pl-xl">
                  <Text variant="body-sm" tone="muted">
                    When off, no points accrue and the rewards card is hidden
                    everywhere.
                  </Text>
                </Box>
              </Stack>
            </Box>
            <Box className="rounded-xl border border-outline-variant bg-surface-container-low p-md">
              <Stack gap="xs">
                <Checkbox
                  checked={displayToCustomers}
                  onChange={(checked) => setDisplayToCustomers(checked)}
                  disabled={pending || !enabled}
                  label="Display rewards to customers"
                />
                <Box className="pl-xl">
                  <Text variant="body-sm" tone="muted">
                    Turn off to hide the rewards card from the home and order
                    pages while still letting points accrue in the background.
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <FormField
            label="Points earned per $1 spent"
            hint="Use 0 to pause earning while keeping the program visible."
            error={fieldErrors.pointsPerDollar?.[0]}
          >
            <TextField
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={pointsPerDollar}
              onChange={(event) => setPointsPerDollar(event.target.value)}
              disabled={pending}
            />
          </FormField>

          <Divider />

          <Stack gap="sm">
            <Row justify="between" align="center">
              <Stack gap="none">
                <Heading level={3} variant="headline-sm" size="body-lg">
                  Redeemable tiers
                </Heading>
                <Text variant="body-sm" tone="muted">
                  Customers see these in the rewards modal.
                </Text>
              </Stack>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                caps={false}
                onClick={handleAddTier}
                disabled={pending}
              >
                + Add tier
              </Button>
            </Row>

            {tiers.length === 0 ? (
              <Box className="rounded-xl border border-dashed border-outline-variant p-lg">
                <Stack gap="sm" align="center" className="text-center">
                  <Icon name="redeem" className="text-primary text-2xl" />
                  <Text variant="body-sm" tone="muted">
                    No tiers yet. Add at least one to let customers redeem
                    their points.
                  </Text>
                </Stack>
              </Box>
            ) : (
              <Stack gap="md">
                {tiers.map((tier) => (
                  <Box
                    key={tier.uiKey}
                    className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"
                  >
                    <Stack gap="sm">
                      <Row justify="between" align="center">
                        <Text
                          variant="label-caps"
                          tone="muted"
                          as="span"
                          className="tracking-[0.18em]"
                        >
                          Tier · {tier.id || "draft"}
                        </Text>
                        <IconButton
                          icon="delete"
                          label={`Remove tier ${tier.label || tier.id}`}
                          size="sm"
                          variant="plain"
                          onClick={() => handleRemoveTier(tier.uiKey)}
                          disabled={pending}
                        />
                      </Row>
                      <Box className="grid grid-cols-1 md:grid-cols-3 gap-md">
                        <FormField label="Label" required>
                          <TextField
                            type="text"
                            value={tier.label}
                            placeholder="e.g. $10 store credit"
                            onChange={(event) =>
                              updateTier(tier.uiKey, "label", event.target.value)
                            }
                            onBlur={() => handleLabelBlur(tier.uiKey)}
                            disabled={pending}
                            required
                          />
                        </FormField>
                        <FormField label="Points" required>
                          <TextField
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            value={tier.points}
                            onChange={(event) =>
                              updateTier(
                                tier.uiKey,
                                "points",
                                event.target.value,
                              )
                            }
                            disabled={pending}
                            required
                          />
                        </FormField>
                        <FormField label="Identifier">
                          <TextField
                            type="text"
                            value={tier.id}
                            onChange={(event) =>
                              updateTier(
                                tier.uiKey,
                                "id",
                                slug(event.target.value),
                              )
                            }
                            placeholder="auto-generated"
                            disabled={pending}
                          />
                        </FormField>
                      </Box>
                      <FormField label="Description">
                        <TextField
                          type="text"
                          value={tier.blurb}
                          placeholder="Short blurb shown under the label"
                          onChange={(event) =>
                            updateTier(tier.uiKey, "blurb", event.target.value)
                          }
                          disabled={pending}
                        />
                      </FormField>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>

          {errorMessage ? (
            <Text variant="body-sm" tone="error">
              {errorMessage}
            </Text>
          ) : null}
          {feedback ? (
            <Text variant="body-sm" tone="primary">
              {feedback}
            </Text>
          ) : null}

          <Row justify="end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              caps={false}
              disabled={pending}
              className="rounded-full"
            >
              {pending ? "Saving…" : "Save rewards settings"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Card>
  );
}
