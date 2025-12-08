import "./globals.css";

export const metadata = {
  title: "My Chat App - Web",
  description: "Secure personal chat app - Web client"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}


