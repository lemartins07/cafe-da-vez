export type ShufflableRotationMember = {
  id: string;
  position: number;
};

type Random = () => number;

export function shuffleRotationMembers(
  members: readonly ShufflableRotationMember[],
  random: Random = Math.random,
) {
  const shuffled = [...members].sort(
    (left, right) => left.position - right.position,
  );

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.map((member, position) => ({ ...member, position }));
}
