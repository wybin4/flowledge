import type { Metadata } from "next";
import styles from "./layout.module.css";
import "./globals.css";
import LeftSidebar from "@/components/sidebar/LeftSidebar";
import ThemeWrapper from "@/user/wrappers/ThemeWrapper";
import { ReduxProvider } from "@/redux/provider";
import Preload from "@/components/Preload";
import { LanguageWrapper } from "@/user/wrappers/LanguageWrapper";

export const metadata: Metadata = {
  title: "EduFlow",
  description: "EduFlow — современная платформа для образования",
};

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
                  <LeftSidebar />
                  <div className={styles.contentWrapper}>{children}</div>
                </div>
              </ThemeWrapper>
            </LanguageWrapper>
          </ReduxProvider>
        </Preload>
      </body>
    </html>
  );
}
