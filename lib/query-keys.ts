export const queryKeys = {
  skillProjects: {
    all: () => ["skill-projects"] as const,
    detail: (id: string) => ["skill-projects", id] as const,
  },
  userSettings: () => ["user-settings"] as const,
};
