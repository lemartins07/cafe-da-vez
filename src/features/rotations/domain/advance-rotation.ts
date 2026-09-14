export type RotationMemberStatus = 'ACTIVE' | 'PAUSED';

export type RotationMember = {
  active: boolean;
  id: string;
  position: number;
  status: RotationMemberStatus;
};

export type TurnAction = 'COMPLETED' | 'SKIPPED';

type RotationState = {
  currentPosition: number;
  members: readonly RotationMember[];
};

type AdvanceRotationInput = RotationState & {
  action: TurnAction;
  processedRequestIds: readonly string[];
  requestId: string;
};

type AdvancedRotation = {
  action: TurnAction;
  currentPosition: number;
  status: 'advanced';
  subject: RotationMember;
};

type DuplicateRotationRequest = {
  currentPosition: number;
  status: 'duplicate';
};

type EmptyRotation = {
  currentPosition: number;
  status: 'empty';
};

export type AdvanceRotationResult =
  AdvancedRotation | DuplicateRotationRequest | EmptyRotation;

const isEligible = (member: RotationMember) =>
  member.active && member.status === 'ACTIVE';

const orderMembers = (members: readonly RotationMember[]) =>
  [...members].sort((left, right) => left.position - right.position);

function findEligibleFromPosition(
  members: readonly RotationMember[],
  position: number,
) {
  const orderedMembers = orderMembers(members).filter(isEligible);

  return (
    orderedMembers.find((member) => member.position >= position) ??
    orderedMembers[0]
  );
}

export function getCurrentRotationMember({
  currentPosition,
  members,
}: RotationState) {
  return findEligibleFromPosition(members, currentPosition);
}

export function advanceRotation({
  action,
  currentPosition,
  members,
  processedRequestIds,
  requestId,
}: AdvanceRotationInput): AdvanceRotationResult {
  if (processedRequestIds.includes(requestId)) {
    return { currentPosition, status: 'duplicate' };
  }

  const subject = getCurrentRotationMember({ currentPosition, members });

  if (!subject) {
    return { currentPosition, status: 'empty' };
  }

  const next = findEligibleFromPosition(members, subject.position + 1);

  return {
    action,
    currentPosition: next.position,
    status: 'advanced',
    subject,
  };
}
