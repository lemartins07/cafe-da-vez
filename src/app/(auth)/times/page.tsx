import { TeamOnboarding } from '@/features/teams/components/team-onboarding';
import { getTeamOnboarding } from '@/features/teams/queries';

type TeamsPageProps = { searchParams: Promise<{ q?: string }> };

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const { q } = await searchParams;
  const { memberships, teams } = await getTeamOnboarding(q);

  return (
    <TeamOnboarding memberships={memberships} query={q ?? ''} teams={teams} />
  );
}
