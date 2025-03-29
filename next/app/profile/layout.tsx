import PageLayout from "@/components/pageLayout/PageLayout";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageLayout
            name='profile'
            mainChildren={children}
        />
    );
}
