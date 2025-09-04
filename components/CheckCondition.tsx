import { ReactNode, Suspense } from "react";

type CheckConditionType = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

const SuspendedComponent = async ({
  condition,
  children,
  otherwise,
}: Omit<CheckConditionType, "loadingFallback">) => {
  return (await condition()) ? children : otherwise;
};

export default function CheckCondition({
  condition,
  children,
  loadingFallback,
  otherwise,
}: CheckConditionType) {    
  return (
    <Suspense fallback={loadingFallback}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}
