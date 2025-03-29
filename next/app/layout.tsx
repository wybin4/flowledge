"use client";
import styles from "./layout.module.css";
import "./globals.css";
import LeftSidebar from "@/components/Sidebar/LeftSidebar";
import ThemeWrapper from "@/user/wrappers/ThemeWrapper";
import { ReduxProvider } from "@/redux/provider";
import Preload from "@/components/Preload";
import { LanguageWrapper } from "@/user/wrappers/LanguageWrapper";
import cn from "classnames";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Preload>
          <ReduxProvider>
            <LanguageWrapper>
              <ThemeWrapper>
                <div className={styles.layoutContainer}>
                  <LeftSidebar>
                    {isExpanded => (
                      <div className={cn(styles.contentWrapper, {
                        [styles.expanded]: isExpanded
                      })}>{children}</div>
                    )}
                  </LeftSidebar>
                </div>
              </ThemeWrapper>
            </LanguageWrapper>
          </ReduxProvider>
        </Preload>
      </body>
    </html>
  );
}
