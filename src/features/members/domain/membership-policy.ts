type MemberRole = 'ADMIN' | 'MEMBER';
type MemberStatus = 'ACTIVE' | 'PAUSED';

export function wouldRemoveLastActiveAdmin({
  activeAdminCount,
  nextRole,
  nextStatus,
  targetRole,
  targetStatus,
}: {
  activeAdminCount: number;
  nextRole: MemberRole;
  nextStatus: MemberStatus;
  targetRole: MemberRole;
  targetStatus: MemberStatus;
}) {
  const removesActiveAdmin =
    targetRole === 'ADMIN' &&
    targetStatus === 'ACTIVE' &&
    (nextRole !== 'ADMIN' || nextStatus !== 'ACTIVE');

  return removesActiveAdmin && activeAdminCount <= 1;
}
