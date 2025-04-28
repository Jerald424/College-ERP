import { Suspense, lazy } from "react";
import { ModalLoader } from "src/components/styled";

export default function withLazy(component: any) {
  const LazyComponent = lazy(component);
  return (props: any) => (
    <Suspense fallback={<ModalLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}
