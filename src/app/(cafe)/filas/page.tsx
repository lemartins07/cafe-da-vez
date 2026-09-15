import { RotationList } from '@/features/rotations/components/rotation-list';
import { getCurrentTeamRotations } from '@/features/rotations/queries';
import { getCurrentTeamMembers } from '@/features/members/queries';

export default async function QueuesPage() {
  const [rotations, teamMembers] = await Promise.all([
    getCurrentTeamRotations(),
    getCurrentTeamMembers(),
  ]);

  return (
    <RotationList
      canManageRotations={teamMembers.canManageMembers}
      members={teamMembers.members}
      rotations={rotations}
    />
  );
}
