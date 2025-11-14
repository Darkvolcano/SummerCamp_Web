import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { ChatBubble } from "../components/ChatBubble";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white ">{children}</main>
      <Footer />
      <ChatBubble />
    </div>
  );
}
