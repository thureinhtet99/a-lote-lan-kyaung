import { SelectItem } from "@/components/ui/select";
import states from "@/constants/states.json";

export function StateSelectItems() {
  return Object.entries(states)
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
    .map(([key, value]) => (
      <SelectItem key={key} value={value}>
        {value}
      </SelectItem>
    ));
}
