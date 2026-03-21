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
import DictionaryList from "./pages/DictionaryList";
import DictionaryEditor from "./pages/DictionaryEditor";
import DesignThemeList from "./pages/DesignThemeList";
import DesignThemeEditor from "./pages/DesignThemeEditor";
import DesignTypography from "./pages/DesignTypography";

function Router() {
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
      <Route path={"/dictionary"} component={DictionaryList} />
      <Route path={"/dictionary/new"} component={DictionaryEditor} />
      <Route path={"/dictionary/:id/edit"} component={DictionaryEditor} />
      {/* 디자인 관리 라우트 */}
      <Route path={"/design/themes"} component={DesignThemeList} />
      <Route path={"/design/themes/new"} component={DesignThemeEditor} />
      <Route path={"/design/themes/:id/edit"} component={DesignThemeEditor} />
      <Route path={"/design/typography"} component={DesignTypography} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
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
