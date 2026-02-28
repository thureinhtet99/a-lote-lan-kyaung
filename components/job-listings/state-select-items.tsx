import states from "@/constants/states.json";
import { ComboboxItem } from "../ui/combobox";

export function StateSelectItems() {
  return Object.entries(states)
    .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
    .map(([key, value]) => (
      <ComboboxItem key={key} value={value}>
        {value}
      </ComboboxItem>
    ));
}
