// Tab screen options for routes that should be reachable but have no tab-bar
// button. expo-router 58 redirects away from `href: null` screens entirely,
// so hide only the button instead.
export const hiddenTab = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' as const },
};
