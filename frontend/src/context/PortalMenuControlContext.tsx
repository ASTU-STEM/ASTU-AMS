import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  portalMenuControlService,
  ControlledMenuItem,
  PortalActorRole,
  MENU_CONTROLS_EVENT,
  DEFAULT_PORTAL_MENU_CONTROLS,
} from '../features/admin/services/portalMenuControl.service';

interface PortalMenuControlContextType {
  controls: ControlledMenuItem[];
  loading: boolean;
  isPageClosed: (actor: PortalActorRole, id: string) => boolean;
  getClosedNotice: (actor: PortalActorRole, id: string) => string | undefined;
  getMenuItem: (actor: PortalActorRole, id: string) => ControlledMenuItem | undefined;
  toggleMenuItem: (
    actor: PortalActorRole,
    id: string,
    enabled: boolean,
    closedNotice?: string,
    closedBy?: string
  ) => Promise<void>;
  saveControls: (items: ControlledMenuItem[]) => Promise<void>;
  resetControls: () => Promise<void>;
  refreshControls: () => Promise<void>;
}

const PortalMenuControlContext = createContext<PortalMenuControlContextType>({
  controls: DEFAULT_PORTAL_MENU_CONTROLS,
  loading: false,
  isPageClosed: () => false,
  getClosedNotice: () => undefined,
  getMenuItem: () => undefined,
  toggleMenuItem: async () => {},
  saveControls: async () => {},
  resetControls: async () => {},
  refreshControls: async () => {},
});

export const PortalMenuControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [controls, setControls] = useState<ControlledMenuItem[]>(() =>
    portalMenuControlService.getCachedControls()
  );
  const [loading, setLoading] = useState(false);

  const refreshControls = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await portalMenuControlService.fetchControls();
      setControls(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshControls();

    const handleCustomEvent = (e: any) => {
      if (e.detail?.items) {
        setControls(e.detail.items);
      }
    };

    window.addEventListener(MENU_CONTROLS_EVENT, handleCustomEvent);
    window.addEventListener('storage', (e) => {
      if (e.key === 'astu_portal_menu_controls') {
        setControls(portalMenuControlService.getCachedControls());
      }
    });

    return () => {
      window.removeEventListener(MENU_CONTROLS_EVENT, handleCustomEvent);
    };
  }, [refreshControls]);

  const isPageClosed = useCallback(
    (actor: PortalActorRole, id: string): boolean => {
      const key = `${actor}:${id}`;
      const item = controls.find((i) => i.key === key || (i.actor === actor && i.id === id));
      return item ? item.enabled === false : false;
    },
    [controls]
  );

  const getClosedNotice = useCallback(
    (actor: PortalActorRole, id: string): string | undefined => {
      const key = `${actor}:${id}`;
      const item = controls.find((i) => i.key === key || (i.actor === actor && i.id === id));
      return item?.closedNotice;
    },
    [controls]
  );

  const getMenuItem = useCallback(
    (actor: PortalActorRole, id: string): ControlledMenuItem | undefined => {
      const key = `${actor}:${id}`;
      return controls.find((i) => i.key === key || (i.actor === actor && i.id === id));
    },
    [controls]
  );

  const toggleMenuItem = useCallback(
    async (
      actor: PortalActorRole,
      id: string,
      enabled: boolean,
      closedNotice?: string,
      closedBy?: string
    ) => {
      const updated = await portalMenuControlService.toggleMenuItem(
        actor,
        id,
        enabled,
        closedNotice,
        closedBy
      );
      setControls(updated);
    },
    []
  );

  const saveControls = useCallback(async (items: ControlledMenuItem[]) => {
    const updated = await portalMenuControlService.saveControls(items);
    setControls(updated);
  }, []);

  const resetControls = useCallback(async () => {
    const updated = await portalMenuControlService.resetControls();
    setControls(updated);
  }, []);

  return (
    <PortalMenuControlContext.Provider
      value={{
        controls,
        loading,
        isPageClosed,
        getClosedNotice,
        getMenuItem,
        toggleMenuItem,
        saveControls,
        resetControls,
        refreshControls,
      }}
    >
      {children}
    </PortalMenuControlContext.Provider>
  );
};

export const usePortalMenuControl = () => useContext(PortalMenuControlContext);
export default PortalMenuControlContext;
