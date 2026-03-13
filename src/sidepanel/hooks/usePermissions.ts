import { useSettingsStore } from '../store/settingsStore';

export function usePermissions() {
  const { sitePermissions, setSitePermission, autoApproveReadOnly, setAutoApproveReadOnly } = useSettingsStore();

  return {
    sitePermissions,
    setSitePermission,
    autoApproveReadOnly,
    setAutoApproveReadOnly,
  };
}
