import { HTMLProps } from "react";
import { Provider } from "react-redux";
import store from "src/redux";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "../screens/errorBoundary";
import { ConfigProvider } from "antd";
import { HashRouter } from "react-router-dom";

interface MainWrapperProps extends HTMLProps<HTMLDivElement> {}

const queryClient = new QueryClient();
export default function MainWrapper({ children }: MainWrapperProps) {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#954535",
            colorTextHeading: "#172B4D",
            colorText: "rgb(66, 82, 110)",
          },
          components: {
            Layout: {},
          },
        }}
      >
        <ErrorBoundary>
          <HashRouter>
            <QueryClientProvider client={queryClient}>
              {children}
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </QueryClientProvider>
          </HashRouter>
        </ErrorBoundary>
      </ConfigProvider>
    </Provider>
  );
}
