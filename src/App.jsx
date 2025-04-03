import { BrowserRouter as Router, Route, Routes } from 'react-router';
import AuthProvider from './context/AuthProvider';
import PrivateRoute from './routes/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import MotorStopByDoorsCycle from './pages/MotorStopByDoorsCycle';
import CimTraining from './pages/CimTraining';
import TestReport from './pages/TestReport';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/motorstop-by-doors-cycle" element={<MotorStopByDoorsCycle />} />
            <Route path="/cim-training" element={<CimTraining />} />
            <Route path="/test-report" element={<TestReport />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}