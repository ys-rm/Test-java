import { ScrumBoard } from "./components/scrum-board";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 text-balance leading-tight">
              Project Board
            </h1>
            <p className="text-lg text-gray-600 text-pretty max-w-2xl mx-auto leading-relaxed">
              Streamline your team's workflow with our elegant task management
              system. Organize, assign, and track progress with beautiful
              simplicity.
            </p>
          </div>
        </header>
        <ScrumBoard />
      </div>
      <Toaster />
    </main>
  );
}

export default App;
