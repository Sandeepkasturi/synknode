
import { Toaster } from "sonner";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ChatPage } from "./pages/ChatPage";
import { PeerProvider } from "./context/PeerContext";
import { FileTransferProvider } from "./context/FileTransferContext";
import "./App.css";

function App() {
  return (
    <>
      <PeerProvider>
        <FileTransferProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster position="top-right" richColors />
        </FileTransferProvider>
      </PeerProvider>
    </>
  );
}

export default App;
