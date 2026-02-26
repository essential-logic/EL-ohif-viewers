import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import ThemeRegistry from './components/ThemeRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DICOM Viewer',
  description: 'Advanced Medical Imaging Viewer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          {children}
          <Toaster />
        </ThemeRegistry>
      </body>
    </html>
  );
}
