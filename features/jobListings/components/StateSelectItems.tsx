import { SelectItem } from "@/components/ui/select";
import states from "@/data/states.json";

export function StateSelectItems() {
  return Object.entries(states)
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
    .map(([abbre, name]) => (
      <SelectItem key={abbre} value={abbre}>
        {name}
      </SelectItem>
    ));
}
