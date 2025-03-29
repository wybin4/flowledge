import PageLayout from "@/components/PageLayout/PageLayout";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageLayout
            name='profile'
            mainChildren={children}
        />
    );
}
