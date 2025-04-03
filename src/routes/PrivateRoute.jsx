import { useState, useCallback } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthProvider";
import { Navigation, Frame, TopBar } from "@shopify/polaris";
import {
  HomeFilledIcon,
  ViewportNarrowIcon,
  LayoutLogoBlockIcon,
  FileIcon,
} from '@shopify/polaris-icons';

const logo = {
  width: 80,
  topBarSource:
    '/images/motum.png',
    contextualSaveBarSource:
    '/images/motum.png',
  accessibilityLabel: 'Motum',
};

const PrivateRoute = () => {
  const navigate = useNavigate();
  const { user, loading, logOut, isAuthChecked } = useAuth();
  
  const [userMenuActive, setUserMenuActive] = useState(false);
  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((userMenuActive) => !userMenuActive),
    [],
  );

  const userMenuActions = [
    {
      items: [{ content: 'Cerrar Sesión', onAction: () => logOut() }],
    },
  ];

  function capitalizeFirstLetter() {
    if (!user || !user?.NAME_AGENT || typeof user?.NAME_AGENT !== "string") return "M";
    const firstChar = user?.NAME_AGENT?.charAt(0) ?? "";
    return /^[A-Za-z]$/.test(firstChar) ? firstChar.toUpperCase() : "M";
  }

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={userMenuActions}
      name={user?.NAME_AGENT ?? ""}
      detail={user?.dpto ?? ""}
      initials={capitalizeFirstLetter()}
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  );
  
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      searchResultsVisible={false}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: 'Inicio',
            icon: HomeFilledIcon,
            onClick: () => navigate("/"),
          },
        ]}
      />
      <Navigation.Section
        separator
        title="Menú"
        items={[
          {
            label: 'CIM Capacitaciones',
            icon: LayoutLogoBlockIcon,
            onClick: () => navigate("/cim-training"),
          },
          {
            label: 'Ciclo de PM por Puerta',
            icon: ViewportNarrowIcon,
            onClick: () => navigate("/motorstop-by-doors-cycle"),
          },
          {
            label: 'Reporte de Prueba',
            icon: FileIcon,
            onClick: () => navigate("/test-report"),
          },
        ]}
        /* action={{
          // icon: ChatIcon,
          accessibilityLabel: 'Contact support',
          onClick: () => {},
        }} */
      />
    </Navigation>
  );

    if (!isAuthChecked) {
        return null; // O un componente de carga
    }

  if (!user && !loading) return <Navigate to="/login" />;

  return (
    <div>
      <Frame
          logo={logo}
          topBar={topBarMarkup}
          navigation={navigationMarkup}
          /* showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={toggleMobileNavigationActive}
          skipToContentTarget={skipToContentRef} */
        >
          <Outlet />
        </Frame>
    </div>
  );
};

export default PrivateRoute;