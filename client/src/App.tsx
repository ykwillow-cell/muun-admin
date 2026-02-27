import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ColumnList from "./pages/ColumnList";
import ColumnEditor from "./pages/ColumnEditor";
import FeaturedColumns from "./pages/FeaturedColumns";
import TestDB from "./pages/TestDB";
import DreamList from "./pages/DreamList";
import DreamEditor from "./pages/DreamEditor";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/test-db"} component={TestDB} />
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Home} />
      <Route path={"/columns"} component={ColumnList} />
      <Route path={"/columns/new"} component={ColumnEditor} />
      <Route path={"/columns/:id/edit"} component={ColumnEditor} />
      <Route path={"/featured"} component={FeaturedColumns} />
      <Route path={"/dreams"} component={DreamList} />
      <Route path={"/dreams/new"} component={DreamEditor} />
      <Route path={"/dreams/:id/edit"} component={DreamEditor} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
