import PublicHeader from "@/components/layout/public/public-header";

export default function LandingPage() {
    return (
        <div className="landing-page">
            <PublicHeader />
            <main className="main-content">
                <h1>Welcome to SmartStudy</h1>
                <p>Your learning platform for all subjects.</p>
            </main>
        </div>
    );
}