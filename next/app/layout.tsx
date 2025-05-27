"use client";
import styles from "./layout.module.css";
import "./globals.css";
import LeftSidebar from "@/components/Sidebar/LeftSidebar";
import ThemeWrapper from "@/user/wrappers/ThemeWrapper";
import { ReduxProvider } from "@/redux/provider";
import Preload from "@/components/Preload";
import { LanguageWrapper } from "@/user/wrappers/LanguageWrapper";
import cn from "classnames";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Preload>
          <ReduxProvider>
            <LanguageWrapper>
              <ThemeWrapper>
                <QueryClientProvider client={queryClient}>
                  <div className={styles.layoutContainer}>
                    <LeftSidebar>
                      {isExpanded => (
                        <div className={cn(styles.contentWrapper, {
                          [styles.expanded]: isExpanded
                        })}>{children}</div>
                      )}
                    </LeftSidebar>
                  </div>
                </QueryClientProvider>
              </ThemeWrapper>
            </LanguageWrapper>
          </ReduxProvider>
        </Preload>
      </body>
    </html>
  );
}
