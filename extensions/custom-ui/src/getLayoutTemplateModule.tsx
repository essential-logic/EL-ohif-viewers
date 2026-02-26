import CustomLayout from './CustomLayout';

export default function getLayoutTemplateModule({
  servicesManager,
  extensionManager,
  commandsManager,
  hotkeysManager,
}) {
  function LayoutWithServices(props) {
    return CustomLayout({
      servicesManager,
      extensionManager,
      commandsManager,
      hotkeysManager,
      ...props,
    });
  }

  return [
    {
      name: 'customMaterialLayout',
      id: 'customMaterialLayout',
      component: LayoutWithServices,
    },
  ];
}
