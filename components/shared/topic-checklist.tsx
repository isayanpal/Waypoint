import { cn } from "@/lib/utils";
import { TopicCheckboxItem } from "@/components/shared/topic-checkbox-item";
import type { Topic } from "@/lib/types/domain";

export function TopicChecklist({
  topics,
  onToggle,
  layout,
}: {
  topics: Topic[];
  onToggle: (topicId: string) => void;
  layout: "list" | "wrap";
}) {
  if (layout === "list") {
    return (
      <div className="flex flex-col gap-[6px]">
        {topics.map((topic) => (
          <TopicCheckboxItem
            key={topic.id}
            label={topic.label}
            done={topic.done}
            onToggle={() => onToggle(topic.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex max-w-[640px] flex-wrap gap-y-[6px]" style={{ columnGap: 22 }}>
      {topics.map((topic) => (
        <TopicCheckboxItem
          key={topic.id}
          label={topic.label}
          done={topic.done}
          onToggle={() => onToggle(topic.id)}
          size="sm"
          className={cn("w-full mobile:w-[290px]")}
        />
      ))}
    </div>
  );
}
