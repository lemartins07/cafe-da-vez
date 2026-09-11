import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Ecommerce from './views/Dashboard/Ecommerce';
import Stocks from './views/Dashboard/Stocks';
import Crm from './views/Dashboard/Crm';
import Marketing from './views/Dashboard/Marketing';
import Analytics from './views/Dashboard/Analytics';
import SignIn from './views/AuthPages/SignIn';
import SignUp from './views/AuthPages/SignUp';
import NotFound from './views/OtherPage/NotFound';
import UserProfiles from './views/UserProfiles';
import Carousel from './views/UiElements/Carousel';
import Maintenance from './views/OtherPage/Maintenance';
import FiveZeroZero from './views/OtherPage/FiveZeroZero';
import FiveZeroThree from './views/OtherPage/FiveZeroThree';
import Videos from './views/UiElements/Videos';
import Images from './views/UiElements/Images';
import Alerts from './views/UiElements/Alerts';
import Badges from './views/UiElements/Badges';
import Pagination from './views/UiElements/Pagination';
import Avatars from './views/UiElements/Avatars';
import Buttons from './views/UiElements/Buttons';
import ButtonsGroup from './views/UiElements/ButtonsGroup';
import Notifications from './views/UiElements/Notifications';
import LineChart from './views/Charts/LineChart';
import BarChart from './views/Charts/BarChart';
import PieChart from './views/Charts/PieChart';
import Invoices from './views/Invoices';
import ComingSoon from './views/OtherPage/ComingSoon';
import FileManager from './views/FileManager';
import Calendar from './views/Calendar';
import BasicTables from './views/Tables/BasicTables';
import DataTables from './views/Tables/DataTables';
import PricingTables from './views/PricingTables';
import Faqs from './views/Faqs';
import Chats from './views/Chat/Chats';
import FormElements from './views/Forms/FormElements';
import FormLayout from './views/Forms/FormLayout';
import Blank from './views/Blank';
import EmailInbox from './views/Email/EmailInbox';
import EmailDetails from './views/Email/EmailDetails';

import TaskKanban from './views/Task/TaskKanban';
import BreadCrumb from './views/UiElements/BreadCrumb';
import Cards from './views/UiElements/Cards';
import Dropdowns from './views/UiElements/Dropdowns';
import Links from './views/UiElements/Links';
import Lists from './views/UiElements/Lists';
import Popovers from './views/UiElements/Popovers';
import Progressbar from './views/UiElements/Progressbar';
import Ribbons from './views/UiElements/Ribbons';
import Spinners from './views/UiElements/Spinners';
import Tabs from './views/UiElements/Tabs';
import Tooltips from './views/UiElements/Tooltips';
import Modals from './views/UiElements/Modals';
import ResetPassword from './views/AuthPages/ResetPassword';
import TwoStepVerification from './views/AuthPages/TwoStepVerification';
import Success from './views/OtherPage/Success';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
import TaskList from './views/Task/TaskList';
import Saas from './views/Dashboard/Saas';
import { ThemeProvider } from './context/ThemeContext';
import { AppWrapper } from './components/common/PageMeta';

export default function App() {
  return (
    <ThemeProvider>
      <AppWrapper>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Ecommerce />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/crm" element={<Crm />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/saas" element={<Saas />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/invoice" element={<Invoices />} />
              <Route path="/faq" element={<Faqs />} />
              <Route path="/pricing-tables" element={<PricingTables />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/form-layout" element={<FormLayout />} />

              {/* Applications */}
              <Route path="/chat" element={<Chats />} />

              <Route path="/task-list" element={<TaskList />} />
              <Route path="/task-kanban" element={<TaskKanban />} />
              <Route path="/file-manager" element={<FileManager />} />

              {/* Email */}

              <Route path="/inbox" element={<EmailInbox />} />
              <Route path="/inbox-details" element={<EmailDetails />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/data-tables" element={<DataTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/breadcrumb" element={<BreadCrumb />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/buttons-group" element={<ButtonsGroup />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/carousel" element={<Carousel />} />
              <Route path="/dropdowns" element={<Dropdowns />} />
              <Route path="/images" element={<Images />} />
              <Route path="/links" element={<Links />} />
              <Route path="/list" element={<Lists />} />
              <Route path="/modals" element={<Modals />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/pagination" element={<Pagination />} />
              <Route path="/popovers" element={<Popovers />} />
              <Route path="/progress-bar" element={<Progressbar />} />
              <Route path="/ribbons" element={<Ribbons />} />
              <Route path="/spinners" element={<Spinners />} />
              <Route path="/tabs" element={<Tabs />} />
              <Route path="/tooltips" element={<Tooltips />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
              <Route path="/pie-chart" element={<PieChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/two-step-verification"
              element={<TwoStepVerification />}
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/success" element={<Success />} />
            <Route path="/five-zero-zero" element={<FiveZeroZero />} />
            <Route path="/five-zero-three" element={<FiveZeroThree />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
          </Routes>
        </Router>
      </AppWrapper>
    </ThemeProvider>
  );
}
