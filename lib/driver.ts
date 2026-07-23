export function calculateDriverExperienceYears(initialExperience: number, createdAt: Date | string): number {
  const created = new Date(createdAt);
  const now = new Date();

  let yearsPassed = now.getFullYear() - created.getFullYear();
  const monthDiff = now.getMonth() - created.getMonth();
  const dayDiff = now.getDate() - created.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    yearsPassed--;
  }

  return (initialExperience || 0) + Math.max(0, yearsPassed);
}
