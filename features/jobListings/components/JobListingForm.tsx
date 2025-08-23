import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingSchema } from "../actions/schemas";

export function JobListingForm() {
  // const form = useForm({
  //   resolver: zodResolver(jobListingSchema),
  // });
  return (
    <div>
      <h1>Job listing form</h1>
    </div>
  );
}
