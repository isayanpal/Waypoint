import type { NewSkillInput } from "@/lib/validations/new-skill";

export function buildRoadmapPrompt(input: NewSkillInput): string {
  return `You are a curriculum designer creating a learning roadmap for a self-taught developer.

Skill to learn: ${input.name}
Learner's goal & context: ${input.goal}
Current level: ${input.level}
Timeline: ${input.timelineMonths} months

Produce a roadmap with EXACTLY 5 phases, in this fixed progression:
1. Fundamentals
2. Core practices
3. Intermediate techniques
4. Advanced topics
5. Portfolio capstone

Each phase needs a short descriptive name and an ordered list of concrete, checkable topics
(3-8 topics per phase) scaled to the learner's level and timeline — more topics per phase for
longer timelines, fewer for shorter ones.

Also produce EXACTLY 2 portfolio projects that let the learner demonstrate what they built.
For each project give: a name, a rough timeline (e.g. "Week 3-4"), a difficulty
(Beginner | Intermediate | Advanced), a 2-3 sentence description, a one-sentence "hook" (why
this project matters), a one-sentence "proves" statement (what completing it demonstrates to
an employer or collaborator), a tech stack list, and phaseIndices — the 0-based indices of the
phases (from the 5 above) this project draws on.

Return only the roadmap in the requested structured format.`;
}
