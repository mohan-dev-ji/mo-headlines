"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState, useCallback, KeyboardEvent } from "react";

interface TopicsSelectorProps {
  value: Id<"topics">[];
  onChange: (topicIds: Id<"topics">[]) => void;
}

export function TopicsSelector({ value, onChange }: TopicsSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const createTopic = useMutation(api.topics.createTopic);
  const topics = useQuery(api.topics.getTopicsByIds, { topicIds: value });

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "," || e.key === "Enter") {
        e.preventDefault();
        const topicName = inputValue.trim();
        if (topicName) {
          const { topicId } = await createTopic({ name: topicName });
          onChange([...value, topicId]);
          setInputValue("");
        }
      }
    },
    [inputValue, value, onChange, createTopic]
  );

  const removeTopic = useCallback(
    (topicId: Id<"topics">) => {
      onChange(value.filter((id) => id !== topicId));
    },
    [value, onChange]
  );

  return (
    <div className="space-y-2">
      <Label>Topics</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {topics?.map((topic) => (
          <div
            key={topic._id}
            className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm border border-gray-200"
          >
            <span>{topic.name}</span>
            <button
              type="button"
              onClick={() => removeTopic(topic._id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a topic and press comma or enter"
      />
      <p className="text-sm text-gray-500">
        Press comma or enter to add a topic
      </p>
    </div>
  );
} 