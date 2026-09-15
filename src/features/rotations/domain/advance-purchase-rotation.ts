import { advanceRotation, type RotationMember } from './advance-rotation';

type AdvancePurchaseRotationInput = {
  buyerId: string;
  currentPosition: number;
  members: readonly RotationMember[];
  purchaseCountsByMemberId: ReadonlyMap<string, number>;
};

type PurchaseRotationState = Pick<
  AdvancePurchaseRotationInput,
  'currentPosition' | 'members' | 'purchaseCountsByMemberId'
>;

type PurchaseRotationForecastInput = PurchaseRotationState & {
  limit: number;
};

const isEligible = (member: RotationMember) =>
  member.active && member.status === 'ACTIVE';

function orderedFromCurrentPosition({
  currentPosition,
  members,
}: Pick<PurchaseRotationState, 'currentPosition' | 'members'>) {
  const orderedMembers = [...members]
    .filter(isEligible)
    .sort((left, right) => left.position - right.position);
  const firstIndex = orderedMembers.findIndex(
    (member) => member.position >= currentPosition,
  );

  if (firstIndex === -1) return orderedMembers;
  return [
    ...orderedMembers.slice(firstIndex),
    ...orderedMembers.slice(0, firstIndex),
  ];
}

export function getCurrentPurchaseRotationMember({
  currentPosition,
  members,
  purchaseCountsByMemberId,
}: PurchaseRotationState) {
  const orderedMembers = orderedFromCurrentPosition({
    currentPosition,
    members,
  });
  const minimumPurchaseCount = Math.min(
    ...orderedMembers.map(
      (member) => purchaseCountsByMemberId.get(member.id) ?? 0,
    ),
  );

  return orderedMembers.find(
    (member) =>
      (purchaseCountsByMemberId.get(member.id) ?? 0) === minimumPurchaseCount,
  );
}

export function getPurchaseRotationForecast({
  currentPosition,
  limit,
  members,
  purchaseCountsByMemberId,
}: PurchaseRotationForecastInput) {
  const forecast: RotationMember[] = [];
  const simulatedCounts = new Map(purchaseCountsByMemberId);
  let nextPosition = currentPosition;

  for (let index = 0; index < limit; index += 1) {
    const currentMember = getCurrentPurchaseRotationMember({
      currentPosition: nextPosition,
      members,
      purchaseCountsByMemberId: simulatedCounts,
    });
    if (!currentMember) break;

    forecast.push(currentMember);
    simulatedCounts.set(
      currentMember.id,
      (simulatedCounts.get(currentMember.id) ?? 0) + 1,
    );
    const advancedRotation = advanceRotation({
      action: 'COMPLETED',
      currentPosition: currentMember.position,
      members,
      processedRequestIds: [],
      requestId: `purchase-forecast-${index}`,
    });
    if (advancedRotation.status !== 'advanced') break;

    nextPosition = advancedRotation.currentPosition;
  }

  return forecast;
}

export function advancePurchaseRotationWhenBuyerIsCurrent({
  buyerId,
  currentPosition,
  members,
  purchaseCountsByMemberId,
}: AdvancePurchaseRotationInput) {
  const currentMember = getCurrentPurchaseRotationMember({
    currentPosition,
    members,
    purchaseCountsByMemberId,
  });
  if (currentMember?.id !== buyerId) {
    return { currentPosition, status: 'unchanged' as const };
  }

  const result = advanceRotation({
    action: 'COMPLETED',
    currentPosition: currentMember.position,
    members,
    processedRequestIds: [],
    requestId: 'past-purchase',
  });

  if (result.status !== 'advanced') {
    return { currentPosition, status: 'unchanged' as const };
  }

  return {
    currentPosition: result.currentPosition,
    status: 'advanced' as const,
  };
}
