"use client"

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const categories = useQuery(api.categories.getAllCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const slug = newCategoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await createCategory({
      name: newCategoryName.trim(),
      slug,
    });

    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  if (!categories) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isAddingCategory ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingCategory(true)}
        >
          Add New Category
        </Button>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button size="sm" onClick={handleAddCategory}>
            Add
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAddingCategory(false);
              setNewCategoryName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
} 