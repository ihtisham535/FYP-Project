import Landing from '@/components/landing/Landing';
import RoleSelect from '@/components/auth/RoleSelect';
import Login from '@/components/auth/Login';
import Otp from '@/components/auth/Otp';
import Signup from '@/components/auth/Signup';
import ForgotPassword from '@/components/auth/ForgotPassword';
import DesktopShell from '@/components/shell/DesktopShell';
import PatientApp from '@/components/shell/PatientApp';
import BackToTop from '@/components/shell/BackToTop';
import Toast from '@/components/shell/Toast';
import LegacyRuntime from '@/components/LegacyRuntime';

export default function Home() {
  return (
    <>
      <Landing />
      <RoleSelect />
      <Login />
      <Otp />
      <Signup />
      <ForgotPassword />
      <DesktopShell />
      <PatientApp />
      <BackToTop />
      <Toast />
      <LegacyRuntime />
    </>
  );
}
