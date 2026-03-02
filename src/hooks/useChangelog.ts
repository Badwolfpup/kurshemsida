import { useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

export type ChangelogItem = string | { text: string; children: string[] };

export interface ChangelogEntry {
  displaydate: string;
  items: ChangelogItem[];
}

interface ChangelogFile {
  displaydate: string | null;
  entries: {
    admin: ChangelogItem[];
    coach: ChangelogItem[];
    student: ChangelogItem[];
  };
}

const changelogModules = import.meta.glob<ChangelogFile>('/src/changelogs/*.json', {
  eager: true,
});

/** SCENARIO: Loads and filters changelog entries by role and non-null displaydate, grouped by date descending. */
export function useChangelog(): ChangelogEntry[] {
  const { role } = useUserRole();

  return useMemo(() => {
    const roleKey: 'admin' | 'coach' | 'student' =
      role === 'Admin' || role === 'Teacher'
        ? 'admin'
        : role === 'Coach'
          ? 'coach'
          : 'student';

    const dateMap = new Map<string, string[]>();

    for (const file of Object.values(changelogModules)) {
      if (!file.displaydate) continue;
      const items = file.entries[roleKey];
      if (!items || items.length === 0) continue;

      const existing = dateMap.get(file.displaydate) ?? [];
      dateMap.set(file.displaydate, [...existing, ...items]);
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([displaydate, items]) => ({ displaydate, items }));
  }, [role]);
}
