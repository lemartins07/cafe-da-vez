import { RotationList } from '@/features/rotations/components/rotation-list';
import { getCurrentTeamRotations } from '@/features/rotations/queries';

export default async function QueuesPage() {
  const rotations = await getCurrentTeamRotations();

  return <RotationList rotations={rotations} />;
}
