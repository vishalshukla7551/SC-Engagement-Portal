export function getHomePathForRole(role: string): string {
  switch (role) {
    case 'ABM':
      return '/ABM';
    case 'ASE':
      return '/ASE';
    case 'ZBM':
      return '/ZBM';
    case 'ZSM':
      return '/ZSM';
    case 'SEC':
      return '/SEC/home';
    case 'SAMSUNG_ADMINISTRATOR':
      return '/Samsung-Administrator';
    case 'ZOPPER_ADMINISTRATOR':
      return '/Zopper-Administrator';
    default:
      return '/';
  }
}
