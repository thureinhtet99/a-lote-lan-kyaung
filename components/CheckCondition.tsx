import { Suspense } from "react";
import Loading from "./loading";
import { CheckConditionType } from "@/types/index.type";

export default function CheckCondition({
  condition,
  children,
  otherwise,
}: CheckConditionType) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}

const SuspendedComponent = async ({
  condition,
  children,
  otherwise,
}: CheckConditionType) => {
  return (await condition()) ? children : otherwise;
};
