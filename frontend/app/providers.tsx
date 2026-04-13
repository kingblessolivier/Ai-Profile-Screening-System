"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import ClientLayout from "@/components/layout/ClientLayout";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ClientLayout>{children}</ClientLayout>
    </Provider>
  );
}
