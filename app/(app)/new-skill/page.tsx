import { NewSkillForm } from "@/components/onboarding/new-skill-form";

export default function NewSkillPage() {
  return (
    <div className="w-full max-w-[1180px] px-[14px] py-4 pb-8 mobile:px-[30px] mobile:py-[22px] mobile:pb-11">
      <div className="max-w-[520px]">
        <div className="mb-[3px] font-heading text-[19px] font-extrabold tracking-tight">
          Add a new skill
        </div>
        <div className="mb-[18px] text-[11.5px] text-wp-ink-secondary">
          Describe your goal and current level. AI will generate a phase-by-phase roadmap,
          portfolio projects, and a topic checklist.
        </div>
        <NewSkillForm />
      </div>
    </div>
  );
}
