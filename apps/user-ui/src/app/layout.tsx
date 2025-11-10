import './global.css';
import Providers from './providers';
import Header from './shared/widgtes/header';
import {Poppins,Roboto} from 'next/font/google'
import { Toaster } from 'react-hot-toast';


export const metadata = {
  title: 'eshop',
  description: 'eshop user application',
};

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100','300','400','500','700','900'],
  variable: '--font-roboto',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600', '700','800','900'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${roboto.variable}`}>

        <Providers>

        <Header />
        {children}
        <Toaster />
          <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1f2937",
                  color: "#ffffff",
                  fontSize: "19px",
                  fontWeight: "500",
                  padding: "16px 24px",
                  borderRadius: "8px",
                  border: "1px solid #374151",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                },
                success: {
                  duration: 3000,
                  style: {
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "600",
                    padding: "16px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.3)",
                  },
                  iconTheme: {
                    primary: "#ffffff",
                    secondary: "#10b981",
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "600",
                    padding: "16px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.3)",
                  },
                  iconTheme: {
                    primary: "#ffffff",
                    secondary: "#ef4444",
                  },
                },
                loading: {
                  style: {
                    background: "#1f2937",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "500",
                    padding: "16px 24px",
                    borderRadius: "8px",
                    border: "1px solid #374151",
                  },
                },
              }}
            />
        </Providers>

        </body>
    </html>
  );
}
